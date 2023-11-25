"use client"
import { useState, useEffect } from "react"
import CourseForm from '@/components/CourseForm'
import ScheduleTable from '@/components/ScheduleTable'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

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


export default function Home() {
  const [addedCourses, setAddedCourses] = useState<Course[] | null>(null);
  const [numberOfCredits, setNumberOfCredits] = useState(0)
  const [showCourseAddedToast, setShowCourseAddedToast] = useState(false)
  const [showCreditsLimitToast, setShowCreditsLimitToast] = useState(false)

  useEffect(() => {
    let credits = 0;
    addedCourses?.forEach(course => {
      credits += course.creditaje
    })
    setNumberOfCredits(credits)
  }, [addedCourses])


  return (
    <Container>
      <Row>
        <h1>FISI - Generador de horarios</h1>
      </Row>
      <Row>
        <CourseForm
          addedCourses={addedCourses}
          setAddedCourses={setAddedCourses}
          numberOfCredits={numberOfCredits}
          setShowCourseAddedToast={setShowCourseAddedToast}
          setShowCreditsLimitToast={setShowCreditsLimitToast}
        />
      </Row>
      <Row>

        <ScheduleTable
          addedCourses={addedCourses}
          setAddedCourses={setAddedCourses}
          numberOfCredits={numberOfCredits} />
      </Row>
      <Row className="mb-3 mt-3 text-center" >
        <a href="https://forms.office.com/r/wfX59SpGqV" className="">¿Encontraste algún bug o quieres realizar una crítica constructiva?</a>
      </Row>
      <ToastContainer
        className="p-3"
        position={'top-end'}

        style={{ zIndex: 1 }}>
        <Toast
          show={showCourseAddedToast}
          delay={3000} bg={'success'}
          autohide
          onClose={() => setShowCourseAddedToast(false)}>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Felicidades 🤠</strong>
          </Toast.Header>
          <Toast.Body>Curso agregado con éxito</Toast.Body>
        </Toast>
        <Toast
          show={showCreditsLimitToast}
          delay={3000} bg={'danger'}
          autohide
          onClose={() => setShowCreditsLimitToast(false)}>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Error 🙁</strong>
          </Toast.Header>
          <Toast.Body>Límite de créditos permitidos alcanzados</Toast.Body>
        </Toast>
      </ToastContainer>

    </Container>
  )
}
