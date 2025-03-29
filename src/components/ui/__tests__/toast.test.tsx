import { render, screen, fireEvent, act } from "@testing-library/react"
import { Toaster } from "../toaster"
import { useToast } from "../use-toast"

// Тестовый компонент для проверки хука useToast
function TestToastComponent() {
  const { toast } = useToast()

  const showToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test toast message",
    })
  }

  return <button onClick={showToast}>Show Toast</button>
}

describe("Toast System", () => {
  beforeEach(() => {
    // Очищаем все тосты перед каждым тестом
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders toast when triggered", () => {
    render(
      <>
        <TestToastComponent />
        <Toaster />
      </>
    )

    // Нажимаем кнопку для показа тоста
    fireEvent.click(screen.getByText("Show Toast"))

    // Проверяем, что тост появился
    expect(screen.getByText("Test Toast")).toBeInTheDocument()
    expect(screen.getByText("This is a test toast message")).toBeInTheDocument()
  })

  it("closes toast when close button is clicked", () => {
    render(
      <>
        <TestToastComponent />
        <Toaster />
      </>
    )

    // Показываем тост
    fireEvent.click(screen.getByText("Show Toast"))

    // Проверяем, что тост появился
    expect(screen.getByText("Test Toast")).toBeInTheDocument()

    // Нажимаем кнопку закрытия
    const closeButton = screen.getByRole("button", { name: "" })
    fireEvent.click(closeButton)

    // Проверяем, что тост исчез
    expect(screen.queryByText("Test Toast")).not.toBeInTheDocument()
  })

  it("automatically closes toast after delay", () => {
    render(
      <>
        <TestToastComponent />
        <Toaster />
      </>
    )

    // Показываем тост
    fireEvent.click(screen.getByText("Show Toast"))

    // Проверяем, что тост появился
    expect(screen.getByText("Test Toast")).toBeInTheDocument()

    // Продвигаем время вперед
    act(() => {
      jest.advanceTimersByTime(1000000)
    })

    // Проверяем, что тост исчез
    expect(screen.queryByText("Test Toast")).not.toBeInTheDocument()
  })

  it("shows multiple toasts with different variants", () => {
    function TestMultipleToasts() {
      const { toast } = useToast()

      const showSuccessToast = () => {
        toast({
          title: "Success",
          description: "Operation completed successfully",
          variant: "default",
        })
      }

      const showErrorToast = () => {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        })
      }

      return (
        <>
          <button onClick={showSuccessToast}>Show Success</button>
          <button onClick={showErrorToast}>Show Error</button>
        </>
      )
    }

    render(
      <>
        <TestMultipleToasts />
        <Toaster />
      </>
    )

    // Показываем тост успеха
    fireEvent.click(screen.getByText("Show Success"))
    expect(screen.getByText("Success")).toBeInTheDocument()

    // Показываем тост ошибки
    fireEvent.click(screen.getByText("Show Error"))
    expect(screen.getByText("Error")).toBeInTheDocument()
  })

  it("updates toast content", () => {
    function TestUpdateToast() {
      const { toast } = useToast()

      const showAndUpdateToast = () => {
        const { update } = toast({
          title: "Initial Title",
          description: "Initial description",
        })

        // Обновляем тост
        update({
          title: "Updated Title",
          description: "Updated description",
        })
      }

      return <button onClick={showAndUpdateToast}>Show and Update Toast</button>
    }

    render(
      <>
        <TestUpdateToast />
        <Toaster />
      </>
    )

    // Показываем и обновляем тост
    fireEvent.click(screen.getByText("Show and Update Toast"))

    // Проверяем, что тост обновился
    expect(screen.getByText("Updated Title")).toBeInTheDocument()
    expect(screen.getByText("Updated description")).toBeInTheDocument()
  })
}) 