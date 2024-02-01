/* eslint-disable react/no-array-index-key */
interface Props {
  release: string;
}

function getColor(word: string) {
  if (word === 'web' || word === 'web-dl' || word === 'webdl') {
    return 'text-green-500';
  }

  if (word === 'bluray') {
    return 'text-sky-400';
  }

  if (word === 'hdtv') {
    return 'text-purple-400';
  }

  if (word === 'h264' || word === 'h265') {
    return 'text-purple-400';
  }

  if (word === 'x264' || word === 'x265') {
    return 'text-red-400';
  }

  if (word === 'dv') {
    return 'text-yellow-400';
  }

  if (word === 'hdr') {
    return 'text-fuchsia-300';
  }

  if (word === 'uhd') {
    return 'text-gray-100';
  }

  if (
    word === 'proper' ||
    word === 'repack' ||
    word === 'rerip' ||
    word === 'internal' ||
    word === 'real'
  ) {
    return 'font-bold';
  }
}

/**
 * Highlight parts of the release name to color code
 */
export function ReleaseName(props: Props) {
  const { release } = props;

  return (
    <div className="text-md flex font-mono">
      {release.split(/[.-]/).map((word, index, arr) => {
        const color = getColor(word.toLowerCase());
        return (
          <span key={index} className={color}>
            {index === arr.length - 1 && '-'}
            {word}
            {index < arr.length - 2 && '.'}
          </span>
        );
      })}
    </div>
  );
}
