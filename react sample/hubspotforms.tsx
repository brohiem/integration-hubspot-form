import axios from "axios"
import React, { useEffect, useState } from "react"

interface IProps {
    element: CustomElement.Element
    context: CustomElement.Context
    handleSave: (value: string) => void
    value: string
}

export const HubspotFormsCustomElement: React.FC<IProps> =
    ({ element, value, context, handleSave }) => {

        const formId = value ? value.toString() : ""
        const [userInput, setUserInput] = useState(formId)
        const [forms, setForms] = useState(new Array())

        useEffect(() => {
            if (value) {
                setUserInput(value.toString())
            }

            const getForms = async () => {
                const formsResponse = await axios.get("/api/hubspot-getforms?accessToken=" + element.config["apiKey"])
                setForms(formsResponse.data)
            }

            getForms();
        }, [value])

        const handleChange = (value: string) => {
            value =  value + "|"  + element.config["portalId"]
            if (value) {
                handleSave(value)
            } else {
                handleSave("")
            }
        }

        return <div className="custom-element">
            <form>
                    <div className="mb-3">
                        <select id="forms" className="form-control" value={userInput} onChange={e => handleChange(e.target.value)} autoComplete="off" >
                            <option value="" selected disabled>Select a form</option>
                            {forms.map(form => <option key={form.guid} value={form.guid}>{form.name}</option>)}
                        </select>
                    </div>
            </form>
        </div>
    }