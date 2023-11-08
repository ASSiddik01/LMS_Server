export type ICourse = {
  name: string
  description: string
  tags: string
  level: string
  demoUrl: string
  price: bigint
  estimatedPrice: bigint
  ratings: number
  purcheses: number
  benifits?: ICourseBenifit[]
  prerequisites?: ICoursePrerequisite[]
  courseData?: ICourseData[]
}

export type ICourseBenifit = {
  title: string
  courseId: string
}

export type ICoursePrerequisite = {
  title: string
  courseId: string
}

export type ICourseData = {
  videoUrl: string
  title: string
  videoSection: string
  description: string
  videoLength: bigint
  videoPlayer: string
  suggetion: string
  courseId: string
}
