"use client"
import { useState, useEffect } from "react"
import CourseForm from '@/components/CourseForm'
import ScheduleTable from '@/components/ScheduleTable'



type ScheduleData = {
  dia: string,
  hora_inicio: number,
  hora_fin: number

}


type SectionData = {
  codigo_seccion: string,
  numero_seccion: number,
  codigo_curso: string,
  carrera: string,
  schedules: ScheduleData[]
}


type Course = {
  carrera: string,
  ciclo: number | '',
  codigo_curso: string,
  id: number,
  nombre_curso: string,
  creditaje: number,
  data: SectionData | null
};

const initialCourses: Course[] = []; // You can provide an initial value if needed

export default function Home() {
  const [addedCourses, setAddedCourses] = useState<Course[]>(initialCourses);
  useEffect(() => {
    console.log(addedCourses)
  }, [addedCourses])

  return (
    <div className="container">
      <div className="row">
        <h1>FISI - Generador de horarios</h1>
      </div>
      <div className='row'>
        <CourseForm addedCourses={addedCourses} setAddedCourses={setAddedCourses} />
      </div>
      <div className='row'>
        <ScheduleTable addedCourses={addedCourses} setAddedCourses={setAddedCourses} />
      </div>
    </div >
  )
}
