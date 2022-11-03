import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const port = 3333;
const app = express();
app.use(cors())
app.use(express.json())

interface AdBodyProps {
	name: string, 
	yearsPlaying: string, 
	discord: string, 
	weekDays: string, 
	hourStart: string, 
	hourEnd: string, 
	useVoiceChannel: boolean
}

const prisma = new PrismaClient({
	log: ['query']
})

app.get("/games", async (req: Request, res: Response) => {
	const games = await prisma.game.findMany({
		select: {
			bannerUrl: true,
			id: true,
			title: true,
			ads: true
		}
	})

	return res.json(games)
})

app.post("/games/:id/ads", async (req: Request, res: Response ) => {
	const gameId = req.params.id;

	const { name, yearsPlaying, discord, weekDays, hourStart, hourEnd, useVoiceChannel }: AdBodyProps = req.body

	const ad = await prisma.ad.create({
		data: {
			name,
			yearsPlaying,
			weekDays,
			discord,
			hourEnd, 
			hourStart,
			useVoiceChannel,
			gameId
		}
	})

	return res.json(ad)
})

app.get("/games/:id/ads", async (req: Request, res: Response) => {
	const gameId = req.params.id;

	const ads = await prisma.ad.findMany({
		where: {
			gameId
		},
		orderBy: {

		}
	})

	return res.json(ads.map( ad => {
		return {
			...ad,
			weekDays: ad.weekDays.split(',')
		}
	}));
})

app.get("/ads/:id/discord", async (req: Request, res: Response) => {
	const adId = req.params.id;

	const ad = await prisma.ad.findUniqueOrThrow({
		select: {
			discord: true
		},
		where: {
			id: adId
		}
	})

	return res.json({
		discord: ad.discord
	})
})

app.listen(port, () => console.log(`Server working at port ${port}`))