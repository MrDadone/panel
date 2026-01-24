import { faChevronDown, faChevronUp, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ReactNode } from 'react';
import { Component, type ErrorInfo } from 'react';
import { useGlobalStore } from '@/stores/global.ts';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  override render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      const appDebug = useGlobalStore.getState().settings.appDebug ?? false;

      return (
        <div className='flex items-center justify-center w-full my-4'>
          <div className='bg-neutral-900 rounded p-4 text-red-500 max-w-4xl w-full'>
            <div className='flex items-start'>
              <FontAwesomeIcon icon={faExclamationTriangle} className='h-5 w-auto mr-3 mt-0.5 flex-shrink-0' />

              <div className='flex-1 min-w-0'>
                <p className='text-sm text-neutral-100 mb-2'>
                  An error was encountered by the application while rendering this view. Try refreshing the page.
                </p>

                {error && appDebug && (
                  <div className='mt-3'>
                    <button
                      onClick={this.toggleDetails}
                      className='flex items-center text-xs text-neutral-400 hover:text-neutral-200 transition-colors mb-2'
                    >
                      <FontAwesomeIcon icon={showDetails ? faChevronUp : faChevronDown} className='h-3 w-auto mr-1' />
                      {showDetails ? 'Hide' : 'Show'} error details
                    </button>

                    {showDetails && (
                      <div className='bg-neutral-800 rounded p-3 mt-2 space-y-3'>
                        <div>
                          <p className='text-xs font-semibold text-red-400 mb-1'>Error Message:</p>
                          <pre className='text-xs text-neutral-300 whitespace-pre-wrap break-words bg-neutral-950 p-2 rounded'>
                            {error.message || 'No error message available'}
                          </pre>
                        </div>

                        {error.stack && (
                          <div>
                            <p className='text-xs font-semibold text-red-400 mb-1'>Stack Trace:</p>
                            <pre className='text-xs text-neutral-300 whitespace-pre-wrap break-words bg-neutral-950 p-2 rounded overflow-x-auto'>
                              {error.stack}
                            </pre>
                          </div>
                        )}

                        {errorInfo && errorInfo.componentStack && (
                          <div>
                            <p className='text-xs font-semibold text-red-400 mb-1'>Component Stack:</p>
                            <pre className='text-xs text-neutral-300 whitespace-pre-wrap break-words bg-neutral-950 p-2 rounded overflow-x-auto'>
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
