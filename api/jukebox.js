const { prisma, express } = require("../common");
const router = express.Router();
module.exports = router;

router.get("/", (req, res) => {
  res.status(200).json({ message: "This works" });
});

router.get("/users", async (req, res) => {

    try {
        const response = await prisma.user.findMany();
        res.status(200).json(response);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/users/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const response = await prisma.user.findFirstOrThrow({
            where: {
                id : +id,
            },
            include: {
                playlists: true,
            },
        });
        res.status(200).json(response);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/users/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const userResponse = await prisma.user.findFirstOrThrow({
            where: {
                id : +id,
            },
            include: {
                playlists: true,
            },
        });

        const playlistIDs = userResponse.playlists.map((playlist) => (playlist.id));

        for(let i = 0 ; i < playlistIDs.length ; i++){
            await prisma.playlist.update({
                where: { id:  +playlistIDs[i]},
                data: { tracks: { set: [] } },
            })
        }

        await prisma.$transaction([
            
            prisma.playlist.deleteMany({
                where: { id: { in: playlistIDs } },
            }),
            prisma.user.update({
                where: { id: +id },
                data: { playlists: { set: [] } },
            }),
            prisma.user.delete({
                where: { id: +id },
            }),
        ]);

        res.sendStatus(204);

    } catch (error) {
        res.status(400).send(error);
    }
});


router.get("/playlists", async (req, res) => {

    try {
        const response = await prisma.playlist.findMany();
        res.status(200).json(response);

    } catch (error) {
        res.status(400).send(error);
    }
});


/** 
 * Test Data Example on Postman
 * {
    "name": "test_list_2",
    "description": "test_description_2",
    "ownerId": "1",
    "trackIds": ["1","2","5","7"]
    }
*/
router.post("/playlists", async (req, res) => {

    try {

        const { name, description, ownerId, trackIds } = req.body;

        if( !name || !description || !ownerId || !trackIds){
            return res.status(400).json({ message: "Missing required fields" });
        }

        const response_ownerId = await prisma.user.findFirstOrThrow({
            where: {
                id: +ownerId,
            },
        });

        if(!response_ownerId) return res.status(400).json({ message: `${ownerId} does not exist in our database.` });

        const numTrackIds = trackIds.map((trackId) =>(+trackId));

        const response_tracks = await prisma.track.findMany({
            where: {
                id: { in: numTrackIds },
            },
        });

        if(response_tracks.length !== trackIds.length){
            return res.status(400).json({ message: "Some track(s) do not exist in our database" });
        } 

        const response = await prisma.playlist.create({
            data: {
                name,
                description,
                ownerId: +ownerId,
                tracks: {
                    connect: numTrackIds.map((trackId) => ({id: trackId})),
                },
            },

        });
        res.status(201).json(response);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/playlists/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const response = await prisma.playlist.findFirstOrThrow({
            where: {
                id: +id,
            },
            include: {
                tracks: true,
            },
        });
        res.status(200).json(response);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/playlists/:id", async (req, res) => {

    try {

        const { id } = req.params;

        await prisma.playlist.update({
            where: {
                id: +id,
            },
            data: {
                tracks: {
                    set: [],
                },
            },
        });

        await prisma.playlist.delete({
            where: {
                id: +id,
            },
        });

        res.sendStatus(204);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/tracks", async (req, res) => {

    try {

        const response = await prisma.track.findMany();
        res.status(200).json(response);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/tracks/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const response = await prisma.track.findFirstOrThrow({
            where: {
                id: +id,
            },
        });
        res.status(200).json(response);

    } catch (error) {
        res.status(400).send(error);
    }
});