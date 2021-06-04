const employeeRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheet');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, rows) => {
        if (error) {
            next(error)
        } else {
            res.status(200).json({employees: rows})
        }
    })
});

employeeRouter.post('/', (req, res, next) => {
    const newEmployee = req.body.employee;
    if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
        res.sendStatus(400)
    } else {
        db.run("INSERT INTO Employee (name, position, wage) VALUES ($name, $pos, $wage);", {
            $name: newEmployee.name,
            $pos: newEmployee.position,
            $wage: newEmployee.wage
        }, function(error) {
            if (error) {
                next(error)
            } else {
                db.get("SELECT * FROM Employee WHERE Employee.id = $id", {$id: this.lastID}, function(err, row) {
                    if (err) {
                        next(err)
                    } else {
                        res.status(201).json({employee: row})
                    }
                })
            }
        })
    }
});

employeeRouter.param('employeeId', (req, res, next, id) => {
    db.get("SELECT * FROM Employee WHERE id = $id", {$id: id}, (err, row) => {
        if (err) {
            next(err)
        } else if (!row) {
            res.sendStatus(404)
        } else {
            req.employee = row;
            next();
        }
    })
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/:employeeId', (req, res, next) => {    
    res.status(200).json({employee: req.employee});    
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    const editedEmployee = req.body.employee;
    if (!editedEmployee.name || !editedEmployee.position || !editedEmployee.wage) {
        return res.sendStatus(400)
    };
    db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id', {
        $name: editedEmployee.name,
        $position: editedEmployee.position,
        $wage: editedEmployee.wage,
        $id: req.employee.id
    }, (error) => {
        if (error) {
            next(error)
        } else {
            db.get('SELECT * FROM Employee WHERE id = $id', {$id: req.employee.id}, (err, row) => {
                res.status(200).json({employee: row})
            })
        }
    })
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $id", {$id: req.employee.id}, (err) => {
        if (err) {
            next(err)
        } else {
            db.get("SELECT * FROM Employee WHERE id = $id", {$id: req.employee.id}, (err, row) => {
                res.status(200).json({employee: row})
            })
        }
    })
});



module.exports = employeeRouter;