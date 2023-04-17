import type { Todo } from "@prisma/client"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "@/lib/prisma"
import { FormEvent, useRef } from "react"
import { useRouter } from "next/router"

export const getServerSideProps: GetServerSideProps<{ data: Array<Pick<Todo, 'id' | 'title' | 'description'>> }> = async () => {
  const todoList = await prisma.todo.findMany({select: { id: true, title: true, description: true }})

  return {
    props: {
      data: todoList
    }
  }
}

const TodoList = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const title = useRef<HTMLInputElement>(null)
  const description = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch('/api/todos', { method: 'POST', body: JSON.stringify({ title: title.current!.value, description: description.current?.value }) })

    if (res.status === 200) {
      router.replace(router.asPath)
    }
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">create Todo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="title" className="font-semibold mb-1">title</label>
            <input ref={title} type="text" id="title" name="title" className="border-gray-400 border rounded-lg p-2" placeholder="input title" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="description" className="font-semibold mb-1">description</label>
            <textarea ref={description} id="description" name="description" className="border-gray-400 border rounded-lg p-2" placeholder="input description"></textarea>
          </div>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">create</button>
        </form>
      </div>

      <div className="w-full max-w-md mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">Todo List</h2>
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="p-2 border border-gray-400">title</th>
              <th className="p-2 border border-gray-400">description</th>
            </tr>
          </thead>
          <tbody>
            {data.map(todo => {
              return (
                <tr key={todo.id}>
                  <td className="p-2 border border-gray-400">{todo.title}</td>
                  <td className="p-2 border border-gray-400">{todo.description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TodoList
