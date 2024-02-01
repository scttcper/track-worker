import { useEffect } from 'react';

const defaultTitle = 'scrdb';

export const useDocumentTitle = function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} - ${defaultTitle}` : defaultTitle;

    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
};
