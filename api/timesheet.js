const timesheetRouter = require('express').Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Timesheet WHERE employee_id = $id", {$id: req.employee.id}, (err, rows) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({timesheets: rows})
        }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    const newTimesheet = req.body.timesheet;
    if (!newTimesheet.hours || !newTimesheet.rate || !newTimesheet.date) {
        return res.sendStatus(400)
    };
    db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $empId)", {
        $hours: newTimesheet.hours,
        $rate: newTimesheet.rate,
        $date: newTimesheet.date,
        $empId: req.employee.id
    }, function(error) {
        if(error) {
            next(error)
        } else {
            db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: this.lastID}, (err, row) => {
                if (err) {
                    next(err)
                } else {
                    res.status(201).json({timesheet: row})
                }
            })
        }
    })
});

timesheetRouter.param('timesheetId', (req, res, next, id) => {
    db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: id}, (err, row) => {
        if (err) {
            next(err);
        } else if (!row) {
            res.sendStatus(404);
        } else {
            req.timesheet = row;
            next();
        }
    })
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const editedTimesheet = req.body.timesheet;
    if (!editedTimesheet.hours || !editedTimesheet.date || !editedTimesheet.rate) {
        return res.sendStatus(400);
    };
    db.run('UPDATE Timesheet SET hours = $hours, date = $date, rate = $rate WHERE id = $id', {
        $hours: editedTimesheet.hours,
        $date: editedTimesheet.date,
        $rate: editedTimesheet.rate,
        $id: req.timesheet.id
    }, (err) => {
        if (err) {
            next(err)
        };
        db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: req.timesheet.id}, (err, row) => {
            if(err) {
                next(err)
            } else {
                res.status(200).json({timesheet: row})
            }
        })
    })
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run('DELETE FROM Timesheet WHERE id = $id',{$id: req.timesheet.id}, (err) => {
        if (err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
});

module.exports = timesheetRouter;