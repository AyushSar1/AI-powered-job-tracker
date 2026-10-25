const express = require('express');
const {getCurrentConversation,} = require('../controllers/conversation');
const router = express.Router();

router.get('/', getCurrentConversation);

module.exports = router;