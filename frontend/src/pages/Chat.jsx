import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import logo from '../assets/letter-j.png'

const Chat = () => {
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || loading) {
      return
    }

    setMessage('')

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ])

    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        '/api/v1/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to send message'
        )
      }

      if (!response.body) {
        throw new Error(
          'Streaming is not supported'
        )
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
        },
      ])

      const reader =
        response.body.getReader()

      const decoder =
        new TextDecoder()

      while (true) {
        const { value, done } =
          await reader.read()

        if (done) {
          break
        }

        const chunk =
          decoder.decode(value, {
            stream: true,
          })

        setMessages((prev) => {
          const updated = [...prev]

          const lastMessage =
            updated[updated.length - 1]

          updated[updated.length - 1] = {
            ...lastMessage,
            content:
              lastMessage.content + chunk,
          }

          return updated
        })
      }
    } catch (err) {
      console.log(err)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, something went wrong.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchCurrentConversation = async () => {
      try {
        const response =
          await axiosInstance.get(
            '/conversations/'
          )

        const data = response.data

        if (data.conversation) {
          setMessages(
            data.conversation.messages || []
          )
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error(
          'Failed to load conversation:',
          error
        )
      }
    }

    fetchCurrentConversation()
}, [])

  return (
    <>
      <nav className="navbar bg-dark fixed-top">
        <div className="container">
          <Link
            to="/dashboard"
            className="navbar-brand"
          >
            <img
              src={logo}
              width="40px"
              alt="Logo"
            />
          </Link>

          <div className="d-flex gap-2">
            <Link
              to="/dashboard"
              className="btn btn-outline-light"
            >
              Dashboard
            </Link>

            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div
        className="container"
        style={{
          marginTop: '6rem',
          marginBottom: '6rem',
          maxWidth: '900px',
        }}
      >
        <h2 className="text-center mb-4">
          AI Career Assistant
        </h2>

        <div
          className="border rounded p-3 mb-3"
          style={{
            minHeight: '400px',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted mt-5">
              <h5>
                Ask me anything about your
                career.
              </h5>

              <p>
                Try asking about your resume,
                skills, or job applications.
              </p>
            </div>
          ) : (
            messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.role === 'user'
                      ? 'text-end'
                      : 'text-start'
                  }`}
                >
                  <div
                    className={`d-inline-block rounded p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-light'
                    }`}
                    style={{
                      maxWidth: '80%',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )
          )}

          {loading && (
            <div className="text-muted">
              AI is typing...
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="d-flex gap-2"
        >
          <input
            type="text"
            className="form-control"
            placeholder="Ask something..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              !message.trim()
            }
          >
            Send
          </button>
        </form>
      </div>
    </>
  )
}

export default Chat