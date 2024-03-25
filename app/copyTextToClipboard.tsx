import { useRef, useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/16/solid';

function CopyToClipboardButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button
      type="button"
      className="rounded-md px-1 py-0.5 font-medium text-sm hover:bg-gray-200/50 hover:text-black"
      title="copy to clipboard"
      onClick={handleClick}
    >
      {copied ? (
        <CheckIcon className="h-3 w-3 text-green-600" aria-hidden="true" color="inherit" />
      ) : (
        <ClipboardIcon className="h-3 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default CopyToClipboardButton;
