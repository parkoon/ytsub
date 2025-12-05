import { YouTubePlayer } from './youtube-player';

interface VideoHeaderProps {
  videoId: string;
  title: string;
  synopsis: string;
}

export function VideoHeader({ videoId, title, synopsis }: VideoHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* YouTube Player - 왼쪽 (PC) */}
      <div className="w-full lg:w-1/2">
        <YouTubePlayer videoId={videoId} />
      </div>

      {/* Title & Synopsis - 오른쪽 (PC) */}
      <div className="w-full lg:w-1/2">
        <h1 className="mb-2 text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-lg">{synopsis}</p>
      </div>
    </div>
  );
}

