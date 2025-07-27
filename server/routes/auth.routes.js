import express from "express";

const router = express.Router()

router.post('/signin', signin)
router.post('/signup', signup)