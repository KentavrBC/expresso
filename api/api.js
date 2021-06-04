const apiRouter = require('express').Router();
const employeeRouter = require('./employee');
const menuRouter = require('./menus');

apiRouter.use('/employees', employeeRouter);
apiRouter.use('/menus', menuRouter);

module.exports = apiRouter;