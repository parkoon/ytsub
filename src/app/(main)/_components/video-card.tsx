import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from '@/types';

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="group cursor-pointer overflow-hidden pt-0 transition-all hover:shadow-md">
      <a href={'video.url'} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="object-cover transition-transform group-hover:scale-102"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardHeader className="py-3">
          <CardTitle className="line-clamp-2 text-lg leading-tight">{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{video.synopsis}</p>
        </CardContent>
      </a>
    </Card>
  );
}
