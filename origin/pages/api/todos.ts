import type { Todo } from '@prisma/client'
import prisma from '@/lib/prisma'

import type { NextApiRequest, NextApiResponse } from 'next'

type Json = {
  title: string
  description?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Todo>
) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const data: Json = JSON.parse(req.body)
  const todo = await prisma.todo.create({ data })
  res.status(200).json(todo)
}
