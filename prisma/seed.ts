import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаем списки
  const lists = await Promise.all([
    prisma.list.create({
      data: {
        title: "Рабочие задачи",
        theme: "blue",
        tasks: {
          create: [
            { text: "Завершить отчет", completed: false },
            { text: "Подготовить презентацию", completed: false },
            { text: "Ответить на письма", completed: true }
          ]
        }
      }
    }),
    prisma.list.create({
      data: {
        title: "Личные дела",
        theme: "green",
        tasks: {
          create: [
            { text: "Купить продукты", completed: false },
            { text: "Оплатить счета", completed: true },
            { text: "Позвонить родителям", completed: false }
          ]
        }
      }
    }),
    prisma.list.create({
      data: {
        title: "Учеба",
        theme: "purple",
        tasks: {
          create: [
            { text: "Изучить JavaScript", completed: false },
            { text: "Прочитать книгу по SQL", completed: false },
            { text: "Сделать домашнее задание", completed: true }
          ]
        }
      }
    })
  ])

  console.log('Seed data created:', lists)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 