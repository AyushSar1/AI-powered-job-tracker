const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes')
  },

  filename: function (req, file, cb) {
  const uniqueName =
    `${req.user.userId}_${Date.now()}${path.extname(file.originalname)}`

  cb(null, uniqueName)
},
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

module.exports = upload