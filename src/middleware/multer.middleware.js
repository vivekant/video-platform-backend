import multer from 'multer'

const storage = multer.diskStorage({
    // cb means call back
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        // following line is to generate unique suffix to add in file name but now we are not using so we are comming to comment it
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //   cb(null, file.fieldname + '-' + uniqueSuffix)


        // this is just normal file(comming file from user) name setting
        cb(null, file.originalname)



    }
})

export const upload = multer(
    {
        storage: storage
    }
)