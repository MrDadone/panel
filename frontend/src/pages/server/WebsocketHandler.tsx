import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import getWebsocketToken from '@/api/server/getWebsocketToken.ts';
import { SocketRequest } from '@/plugins/useWebsocketEvent.ts';
import { Websocket } from '@/plugins/Websocket.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export default function WebsocketHandler() {
  const uuid = useServerStore((state) => state.server.uuid);
  const { socketInstance, setSocketInstance, setSocketConnectionState } = useServerStore();
  const { setState } = useServerStore();
  const { addToast } = useToast();
  const updatingTokenRef = useRef(false);
  const navigate = useNavigate();

  const updateToken = (uuid: string, socket: Websocket) => {
    if (updatingTokenRef.current) {
      return;
    }

    updatingTokenRef.current = true;
    getWebsocketToken(uuid)
      .then((data) => socket.setToken(data.token, true))
      .catch((error) => console.error(error))
      .finally(() => {
        updatingTokenRef.current = false;
      });
  };

  const connect = (uuid: string) => {
    const socket = new Websocket();

    socket.once('auth success', () => {
      setSocketConnectionState(true);
      socket.send(SocketRequest.CONFIGURE_SOCKET, ['transmission mode', 'binary']);
    });
    socket.on('SOCKET_CLOSE', (reason: string) => {
      switch (reason) {
        case 'permission revoked':
          navigate('/');
          addToast('Connection to the server has been closed: permission revoked.', 'error');
          break;
        default:
          setSocketConnectionState(false);
          break;
      }
    });
    socket.on('SOCKET_ERROR', () => {
      setSocketConnectionState(false);
    });
    socket.on('status', (status) => setState(status));

    socket.on('daemon error', (message: string) => {
      console.warn('Got error message from daemon socket:', message);
    });

    socket.on('token expiring', () => updateToken(uuid, socket));
    socket.on('token expired', () => updateToken(uuid, socket));
    socket.on('jwt error', (error: string) => {
      setSocketConnectionState(false);
      console.warn('JWT validation error from wings:', error);

      if (error.toLowerCase().includes('expired')) {
        updateToken(uuid, socket);
      }
    });

    getWebsocketToken(uuid)
      .then((data) => {
        // Connect and then set the authentication token.
        socket.setToken(data.token).setUseBinary(true).connect(data.socket);

        // Once that is done, set the instance.
        setSocketInstance(socket);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    return () => {
      if (socketInstance) {
        socketInstance.close();
      }
    };
  }, [socketInstance]);

  useEffect(() => {
    if (socketInstance || !uuid) {
      return;
    }

    connect(uuid);
  }, [uuid]);

  return null;
}
