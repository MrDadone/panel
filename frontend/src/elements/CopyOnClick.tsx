import classNames from 'classnames';
import { useToast } from '@/providers/ToastProvider.tsx';

export function copyToClipboard(text: string) {
  if (!window.isSecureContext) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise<void>((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject();
      textArea.remove();
    }).catch(() => {
      const successful = window.prompt('Copy to clipboard: Ctrl+C or Command+C, Enter', text);
      if (successful === null) {
        return Promise.reject();
      }
    });
  }

  return navigator.clipboard.writeText(text);
}

export default function CopyOnClick({
  enabled = true,
  content,
  className,
  children,
}: {
  enabled?: boolean;
  content: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { addToast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();

    copyToClipboard(content)
      .then(() => {
        addToast('Copied to clipboard');
      })
      .catch((err) => {
        console.error(err);
        addToast('Failed to copy to clipboard.', 'error');
      });
  };

  return enabled ? (
    <button onClick={handleCopy} className={classNames('cursor-pointer', className)}>
      {children}
    </button>
  ) : (
    children
  );
}
