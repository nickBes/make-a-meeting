import { Button, Stack, TextInput } from "@mantine/core"
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates"
import { useInputState } from "@mantine/hooks"
import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { CreateMeetingData } from "@/pages/api/meeting"
import { dateToDays } from "@/utils"

const Create: React.FC = () => {
    const [days, setDays] = useState<[number, number]>()
    const [name, setName] = useInputState("")

    const mutation = useMutation(async (createMeetingData: CreateMeetingData) => {
        const response = await axios.post<{ meetingId: string }>('/api/meeting/', createMeetingData)
        return response.data
    }, {
        onError: (err) => console.log(err),
        onSuccess: (data) => console.log(data)
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
                end
            }

            console.log(createMeetingData)

            mutation.mutate(createMeetingData)
        }
    }

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            submit()
        }}>
            <Stack align="center">
                <TextInput
                    withAsterisk
                    label="Meeting Name"
                    onChange={setName}
                />
                <DateRangePicker
                    withAsterisk
                    label="Meeting Dates"
                    minDate={new Date()}
                    onChange={setDatesIntoDays}
                />
                <Button type="submit">Submit</Button>
            </Stack>
        </form>
    )
}

export default Create