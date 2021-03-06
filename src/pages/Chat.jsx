import { Box, TextField, Button } from '@skynexui/components';
import React, { useContext, useState, useEffect } from 'react';
import appConfig from '../../config.json';
import imgBackground from '../../src/img/background.png';

import Header from '../components/chat/Header';
import MessageList from '../components/chat/MessageList';
import dateNow from '../components/chat/DateNow';
import ButtonSendSticker from '../components/chat/ButtonSendStickers';

import { createClient } from '@supabase/supabase-js';
import { AuthContext } from '../components/providers/auth';
import Title from '../components/Title';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI4MTE0NSwiZXhwIjoxOTU4ODU3MTQ1fQ.dCSV21zZAEES9OayAjG52TLt946pY4a7nWAOmls53Wk'
const SUPABASE_URL = 'https://oveqdqsqcyvqfzzsmacf.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function listenToMessages(addMessage) {
  return supabaseClient.from('messages').on('INSERT', (data) => {
    addMessage(data.new)
  }).subscribe()
}

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [listMessage, setListMessage] = useState([])

  const { infoGit } = useContext(AuthContext)

  useEffect(() => {
    const datasSupabase = supabaseClient.from('messages').select('*').order('id', { ascending: false })
      .then(({ data }) => setListMessage(data))

    listenToMessages((newMessage) => {
      setListMessage((currentList) => {
        return [
          newMessage,
          ...currentList
        ]
      })
    })
  }, [])

  function handleNewMessage(newMessage) {
    const message = {
      from: infoGit.name,
      messageText: newMessage,
      date: dateNow(),
      login: infoGit.login
    }

    supabaseClient.from('messages').insert([message]).then()
    setMessage('')
  }

  async function deleteMessage(id){
    await supabaseClient.from('messages').delete().match({id})
    await supabaseClient.from('messages').select('*').order('id', { ascending: false })
    .then(({ data }) => setListMessage(data))
  }

  if (infoGit.id) {
    return (

      <Box
        styleSheet={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: `url(${imgBackground.src})`,
          backgroundRepeat: 'no-repeat', backgroundSize: 'cover',
          color: appConfig.theme.colors.neutrals['000']
        }}
      >
        <Box
          styleSheet={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
            borderRadius: '5px',
            backgroundColor: appConfig.theme.colors.neutrals[700],
            height: '100%',
            maxWidth: '95%',
            maxHeight: '95vh',
            padding: '32px',
          }}
        >
          <Header />
          <Box
            styleSheet={{
              position: 'relative',
              display: 'flex',
              flex: 1,
              height: '80%',
              backgroundColor: appConfig.theme.colors.neutrals[600],
              flexDirection: 'column',
              borderRadius: '5px',
              padding: '16px',
            }}
          >

            <MessageList messages={listMessage} deleteMessage={deleteMessage}/>

            <Box
              as="form"
              styleSheet={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5px',
              }}
            >
              <TextField
                placeholder="Insira sua mensagem aqui..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                }
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    message.length > 0 && handleNewMessage(message)
                  }
                }}
                type="textarea"
                styleSheet={{
                  width: '100%',
                  border: '0',
                  resize: 'none',
                  borderRadius: '5px',
                  padding: '6px 8px',
                  backgroundColor: appConfig.theme.colors.neutrals[800],
                  marginRight: '4px',
                  marginTop: '10px',
                  color: appConfig.theme.colors.neutrals[200],
                }}
              />

              <ButtonSendSticker onClickSticker={(sticker) => {
                handleNewMessage(`:sticker:${sticker}`)
              }} />

              <Button
                type='button'
                label='Enviar'
                styleSheet={{
                  height: '70%'
                }}
                onClick={() => message.length > 0 && handleNewMessage(message)}
                buttonColors={{
                  contrastColor: appConfig.theme.colors.neutrals["000"],
                  mainColor: appConfig.theme.colors.primary[500],
                  mainColorLight: appConfig.theme.colors.primary[400],
                  mainColorStrong: appConfig.theme.colors.primary[600],
                }}
              />
            </Box>
          </Box>
        </Box>
        <Title title="Chat" />
      </Box>
    )
  } else {
    return <><Title title="Error" /></>
  }
}