import {
  type CreateWidgetOptions,
  type FRCWidgetCompleteEvent,
  type FRCWidgetErrorEventData,
  FriendlyCaptchaSDK,
  type WidgetErrorData,
  type WidgetHandle,
} from '@friendlycaptcha/sdk';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const sdk = new FriendlyCaptchaSDK({
  apiEndpoint: 'global',
  disableEvalPatching: false,
});

type Props = Omit<CreateWidgetOptions, 'element'> & {
  onComplete?: (response: string) => void;
  onError?: (error: WidgetErrorData) => void;
  onExpire?: () => void;
};

export type Ref = {
  getResponse: () => string | undefined;
  reset: () => void;
};

const FriendlyCaptcha = forwardRef<Ref, Props>((props, ref) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<WidgetHandle | null>(null);

  const { onComplete, onError, onExpire, ...widgetOptions } = props;

  useEffect(() => {
    if (captchaRef.current && sdk) {
      widgetRef.current = sdk.createWidget({
        element: captchaRef.current,
        ...widgetOptions,
      });

      return () => widgetRef.current?.destroy();
    }
  }, Object.values(widgetOptions));

  useEffect(() => {
    const element = captchaRef.current;
    if (!element) return;

    const handleComplete = (e: Event) => {
      if (onComplete) {
        onComplete((e as FRCWidgetCompleteEvent).detail.response);
      }
    };

    const handleError = (e: Event) => {
      if (onError) {
        onError((e as CustomEvent<FRCWidgetErrorEventData>).detail.error);
      }
    };

    if (onComplete) {
      element.addEventListener('frc:widget.complete', handleComplete);
    }
    if (onError) {
      element.addEventListener('frc:widget.error', handleError);
    }
    if (onExpire) {
      element.addEventListener('frc:widget.expire', onExpire);
    }

    return () => {
      if (onComplete) {
        element.removeEventListener('frc:widget.complete', handleComplete);
      }
      if (onError) {
        element.removeEventListener('frc:widget.error', handleError);
      }
      if (onExpire) {
        element.removeEventListener('frc:widget.expire', onExpire);
      }
    };
  }, [onComplete, onError, onExpire]);

  useImperativeHandle(ref, () => ({
    getResponse: () => widgetRef.current?.getResponse(),
    reset: () => widgetRef.current?.reset(),
  }));

  return <div ref={captchaRef} />;
});

export default FriendlyCaptcha;
