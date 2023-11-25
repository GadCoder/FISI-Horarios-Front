"use client"
import { useState, useEffect } from "react"
import CourseForm from '@/components/CourseForm'
import ScheduleTable from '@/components/ScheduleTable'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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

  return (
    <Container>
      <Row>
        <h1>FISI - Generador de horarios</h1>
      </Row>
      <Row>
        <CourseForm addedCourses={addedCourses} setAddedCourses={setAddedCourses} />
      </Row>
      <Row>
        <ScheduleTable addedCourses={addedCourses} setAddedCourses={setAddedCourses} />
      </Row>
      <Row className="mb-3 mt-3 text-center" >
        <a href="https://forms.office.com/r/wfX59SpGqV" className="link">¿Encontraste algún bug o quieres realizar una crítica constructiva?</a>
      </Row>
    </Container>
  )
}
