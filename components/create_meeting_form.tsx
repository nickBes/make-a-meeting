import { Button, Stack, Textarea, TextInput, Title } from "@mantine/core"
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates"
import { useInputState } from "@mantine/hooks"
import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { CreateMeetingData } from "@/pages/api/meeting"
import { dateToDays } from "@/utils"
import { Meeting } from "@prisma/client"

interface CreateMeetingFormProps {
    onSubmited: () => void
    onSuccess: (meeting: Meeting) => void
}

const CreateMeetingForm: React.FC<CreateMeetingFormProps> = ({ onSubmited, onSuccess }) => {
    const [days, setDays] = useState<[number, number]>()
    const [name, setName] = useInputState("")
    const [desc, setDesc] = useInputState("")
    const [isDisabled, setIsDisabled] = useState(false)

    const mutation = useMutation(async (createMeetingData: CreateMeetingData) => {
        setIsDisabled(true)
        const response = await axios.post<{ meeting: Meeting }>('/api/meeting/', createMeetingData)
        setIsDisabled(false)
        onSubmited()
        return response.data
    }, {
        onError: (err) => console.log(err),
        onSuccess: (data) => {
            onSuccess(data.meeting)
        }
    })

    function setDatesIntoDays([start, end]: DateRangePickerValue) {
        if (start && end) {
            setDays([start, end].map(dateToDays) as [number, number])
        }
    }

    function submit() {


        if (name != "" && days) {
            const [start, end] = days
            let createMeetingData: CreateMeetingData = {
                name,
                start,
                end,
                desc
            }

            mutation.mutate(createMeetingData)
        }
    }

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            submit()
        }}>
            <Stack align="stretch" justify="center">
                <TextInput
                    withAsterisk
                    label="Meeting Name"
                    onChange={setName}
                />
                <Textarea
                    onChange={setDesc}
                    label="Meeting Description" />
                <DateRangePicker
                    withAsterisk
                    label="Meeting Dates"
                    minDate={new Date()}
                    onChange={setDatesIntoDays}
                />
                <Button disabled={isDisabled} type="submit" uppercase>Submit</Button>
            </Stack>
        </form>
    )
}

export default CreateMeetingForm