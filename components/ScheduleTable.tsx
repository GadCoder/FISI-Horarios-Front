import { useState, useEffect, useRef } from "react"
import { Button } from 'react-bootstrap';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


export default function ScheduleTable({ courses, setCourses }) {

    const days = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]
    const baseColors = [
        "#fbf8cc",
        "#fde4cf",
        "#ffcfd2",
        "#f1c0e8",
        "#cfbaf0",
        "#a3c4f3",
        "#90dbf4",
        "#8eecf5",
        "#98f5e1",
        "#b9fbc0",
    ]

    const [availableColors, setAvailableColors] = useState(baseColors)
    const [assignedColors, setAssignedColors] = useState({})
    const [buttonsVisible, setButtonsVisible] = useState(true);

    const hours = Array.from({ length: 14 }, (_, index) => index + 8);
    const [scheduleCourses, setScheduleCourses] = useState(() => {
        const initialScheduleFields = {};
        days.forEach(day => {
            initialScheduleFields[day] = [];

        });
        return initialScheduleFields;
    });
    const tableRef = useRef(null);

    const getAvailableColor = () => {
        let color = availableColors[0]
        if (availableColors.length == 1) {
            setAvailableColors(baseColors)
            return color
        }
        setAvailableColors(availableColors.slice(1))
        return color
    }
    const assignColorToCourse = (courseName, courseColor) => {
        const newAssignedColors = assignedColors
        newAssignedColors[courseName] = courseColor
        setAssignedColors(newAssignedColors)
    }

    useEffect(() => {
        courses.forEach(course => {
            const courseName = course.courseName
            if ((courseName in assignedColors)) {
                return
            }
            const courseColor = getAvailableColor()
            assignColorToCourse(courseName, courseColor)
            const sectionNumber = course.data.sectionNumber

            course.data.schedules.forEach(schedule => {
                const day = schedule.dia
                const startTime = schedule.hora_inicio
                const endTime = schedule.hora_fin
                const duration = endTime - startTime

                scheduleCourses[day].push({
                    'name': courseName,
                    'sectionNumber': sectionNumber,
                    'startTime': startTime,
                    'duration': duration

                })

            })
        })

    }, [courses])





    const deleteCourseFromAssignedColors = (courseName) => {
        const assignedColor = assignedColors[courseName]
        const updatedAssignedColors = Object.fromEntries(
            Object.entries(assignedColors).filter(([key]) => key !== courseName)
        );
        setAssignedColors(updatedAssignedColors)
        setAvailableColors([...availableColors, assignedColor])

    }


    const handleDeleteButton = (courseName) => {
        deleteCourseFromAssignedColors(courseName)
        const updatedCourses = []
        const updatedScheduleCourses = {}
        days.forEach(day => {
            updatedScheduleCourses[day] = []
            scheduleCourses[day].forEach(course => {
                if (course.name != courseName) {
                    updatedScheduleCourses[day].push(course)
                }
            })
        })
        courses.forEach(course => {
            if (course.courseName != courseName) {
                updatedCourses.push(course)
            }
        })

        setCourses(updatedCourses)
        setScheduleCourses(updatedScheduleCourses)
    }
    const createDeleteCourseButton = (courseName) => {
        return (
            <Button
                variant="danger"
                style={{ display: buttonsVisible ? 'block' : 'none' }}
                onClick={() => handleDeleteButton(courseName)
                }
            >
                Eliminar curso
            </Button >
        )

    }
    const createCourseCell = (name, sectionNumber, duration, key) => {
        const cellText = `${name} G.${sectionNumber}`
        const cellBackgroundColor = assignedColors[name]

        return <td rowSpan={duration} key={key} style={{
            backgroundColor: cellBackgroundColor,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            padding: '3em'
        }}>
            <div className="row mb-3" style={{ textAlign: "center" }} >
                <span>
                    {cellText}

                </span>
            </div >
            <div className="row ">
                {createDeleteCourseButton(name)}
            </div>

        </td >

    }
    const createEmptyCell = (key) => {
        return <td key={key} style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
        }}></td>

    }


    const createHourCell = (hour) => {
        return <td className="text-center">{`${hour}:00-${hour + 1}:00`}</td>

    }

    const createCellsTable = (hour) => {
        const hourCells = []
        for (let i = 0; i < 6; i++) {
            const day = days[i]
            let courseAssigned = false
            let skipCell = false
            scheduleCourses[day].map(course => {
                if (course.startTime == hour) {
                    const courseCell = createCourseCell(course.name, course.sectionNumber, course.duration, hour + day)
                    hourCells.push(courseCell)
                    courseAssigned = true
                } else {
                    console.log("Hour: " + hour)
                    for (let j = hour; j >= hour - 5; j--) {
                        if (course.startTime == j && !courseAssigned && hour < course.startTime + course.duration) {
                            console.log("Deleting td")
                            skipCell = true

                        }
                    }
                }
            })
            if (!courseAssigned) {
                console.log("Number of td: " + hourCells.length)
                const emptyCell = createEmptyCell(hour + day)
                if (!skipCell)
                    hourCells.push(emptyCell)
            }
        }
        return (
            hourCells.map(cell => {
                return cell
            })
        )

    }

    return (
        <Container className="mt-3">
            <Row>
                <h2 style={{ textAlign: "center" }}>HORARIOS</h2>
            </Row>
            <Row>
                <div style={{ overflowX: "auto" }} id="table-container">
                    <table className="table table-bordered" ref={tableRef}>
                        <thead>
                            <tr>
                                <th className="text-center">HORA</th>
                                {days.map((dia, index) => (
                                    <th key={index} className="text-center">
                                        {dia}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map((hour, hourIndex) => (
                                <tr key={hourIndex}>
                                    {createHourCell(hour)}
                                    {createCellsTable(hour)}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Row>

        </Container>

    )
}