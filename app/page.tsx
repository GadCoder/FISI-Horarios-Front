"use client"
import { useState, useEffect } from "react"
import CourseForm from '@/components/CourseForm'
import ScheduleTable from '@/components/ScheduleTable'

type ScheduleData = {
  dia: string,
  hora_inicio: number,
  hora_fin: number

}
type Schedule = {
  codigo_seccion: string,
  numero_seccion: number,
  schedules: ScheduleData[]
}


type SectionData = {
  codigo_seccion: string,
  numero_seccion: number,
  codigo_curso: string,
  carrera: string,
  schedules: ScheduleData[]
}

type Course = {
  courseName: string,
  courseCode: string,
  major: string,
  semester: number | '',
  data: SectionData
};


const initialCourses: Course[] = []; // You can provide an initial value if needed

export default function Home() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  useEffect(() => {
  }, [courses])

  return (
    <div className="container">
      <div className="row">
        <h1>FISI - Generador de horarios</h1>
      </div>
      <div className='row'>
        <CourseForm courses={courses} setCourses={setCourses} />
      </div>
      <div className='row'>
        <ScheduleTable courses={courses} setCourses={setCourses} />
      </div>
    </div >
  )
}
