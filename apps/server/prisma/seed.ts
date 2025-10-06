import { prisma } from '../src/lib/prisma';

async function main() {
  const count = await prisma.workoutVideo.count();
  if (count === 0) {
    await prisma.workoutVideo.createMany({
      data: [
        {
          title: 'Full Body HIIT 20m',
          description: 'High-intensity interval training for fat loss',
          durationSec: 1200,
          level: 'Intermediate',
          muscleGroup: 'Full Body',
          videoUrl: 'https://videos.example.com/hiit-20m.mp4',
          thumbnailUrl: 'https://images.example.com/hiit-20m.jpg',
        },
        {
          title: 'Upper Body Strength 30m',
          description: 'Strength training for upper body',
          durationSec: 1800,
          level: 'Beginner',
          muscleGroup: 'Upper Body',
          videoUrl: 'https://videos.example.com/upper-30m.mp4',
          thumbnailUrl: 'https://images.example.com/upper-30m.jpg',
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
