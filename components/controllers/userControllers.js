const dbQuery = require('../../db')

exports.userSignup = async (req, res) => {
    const { user_username, user_email, user_phone, user_password } = req.body

    let checkUsername = false, checkEmail = false, checkPhone = false

    const [findUsername] = await dbQuery.execute('SELECT 1 FROM User WHERE user_username = ? LIMIT 1', [user_username])
    if(findUsername.length > 0) checkUsername = true
    else checkUsername = false

    const [findEmail] = await dbQuery.execute('SELECT 1 FROM User WHERE user_email = ? LIMIT 1', [user_email])
    if(findEmail.length > 0) checkEmail = true
    else checkEmail = false

    const [findPhone] = await dbQuery.execute('SELECT 1 FROM User WHERE user_phone = ? LIMIT 1', [user_phone])
    if(findPhone.length > 0) checkPhone = true
    else checkPhone = false

    if(checkUsername) return res.status(403).send({ code: 0, msg: 'มีชื่อผู้ใช้งานนี้อยู่แล้ว' })
    else if(checkEmail) return res.status(403).send({ code: 0, msg: 'มีอีเมลนี้อยู่แล้ว' })
    else if(checkPhone) return res.status(403).send({ code: 0, msg: 'มีเบอร์โทรศัพท์นี้อยู่แล้ว' })
    else {
        await dbQuery.execute('INSERT INTO User (user_username, user_email, user_password, user_phone, user_role) VALUES (?, ?, ?, ?, "User")', [user_username, user_email, user_password, user_phone])
        .then(([response]) => {
            return res.status(200).send({ msg: 'ลงทะเบียนสำเร็จ' })
        })
        .catch((err) => {
            return res.status(403).send({ msg: 'เกิดข้อผิดพลาดในการลงทะเบียน' })
        })
    }
}

exports.userSignin = async (req, res) => {
    const { user_username, user_password } = req.body
    const [findUserLogin] = await dbQuery.execute('SELECT User.*, Bike_repair.bp_id FROM User LEFT JOIN Bike_repair ON User.user_id = Bike_repair.user_id WHERE (User.user_username = ? OR User.user_email = ? OR User.user_phone = ?) AND User.user_password = ? LIMIT 1', [user_username, user_username, user_username, user_password])
    if(findUserLogin.length > 0) {
        return res.status(200).send({ msg: 'เข้าสู่ระบบสำเร็จ', user_id: findUserLogin[0].user_id, user_role: findUserLogin[0].user_role, bp_id: findUserLogin[0].bp_id }) 
    } else return res.status(404).send({ msg: 'ชื่อผู้ใช้งาน/รหัสผ่าน ไม่ถูกต้อง' })
}

exports.updateLocation = async (req, res) => {
    const { user_id, user_lat, user_lng } = req.body

    await dbQuery.execute('UPDATE User SET user_lat = ?, user_lng = ? WHERE user_id = ?', [Number(user_lat), Number(user_lng), user_id])
    .then((response) => {
        return res.status(200).send({ msg: 'อัปเดตสำเร็จ' })
    })
    .catch((err) => {
        return res.status(403).send({ msg: 'ไม่สามารถอัปเดตได้' })
    })
}