const { prisma } = require("./common");
const { faker } = require("@faker-js/faker");

const seed = async () => {
  try {

    const numUser = 5;
    const numTrack = 20;
    const numPlaylist = 10;

    const users = [];
    const tracks = [];
    
    for(let i = 0 ; i < numUser ; i++){
        const response = await prisma.user.create({
            data: {
                username: faker.person.fullName(),
            },
        });
        users.push(response);
    }

    for(let i = 0 ; i < numTrack ; i++){
        const response = await prisma.track.create({
            data: {
                name: faker.music.album(),
            },
        });
        tracks.push(response);
    }

    for(let i = 0 ; i < numPlaylist ; i++){

        const randomUser = Math.floor(Math.random() * numUser);

        const response = await prisma.playlist.create({
            data: {
                name: faker.music.songName(),
                description: faker.music.genre(),
                ownerId: users[randomUser].id,
                tracks: {
                    connect: getRandomTracks(tracks),
                },
            },
        });
    }

  } catch (error) {
    console.error(error);
  }
};

const getRandomTracks = (tracks) => {

    const randomTracks = [];
    const numRandomTracks = 2 + Math.floor(Math.random() * 5);

    while(randomTracks.length < numRandomTracks){
        
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        if(!randomTracks.includes(randomTrack)) randomTracks.push(randomTrack);
    }
    return randomTracks.map((track) => ({id: track.id}));
};

seed();
