import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { AutoComplete } from "primereact/autocomplete";
import { Button } from 'primereact/button';


const Generate_payslip = () => {
    const [ingredient, setIngredient] = React.useState('All');
    const [value1, setValue1] = useState('');
    const [date, setDate] = useState(null);
    const [value, setValue] = useState('');
    const [items, setItems] = useState([]);
    const [value2, setValue2] = useState('');
    const [loading, setLoading] = useState(false);


    const search = (event) => {
        setItems([...Array(10).keys()].map(item => event.query + '-' + item));
    }

    const load = () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <>
            <Form>
                <div className="d-flex flex-wrap gap-3">
                    <div className="flex align-items-center">
                        <RadioButton 
                            inputId="ingredient1" 
                            name="all" 
                            value="All" 
                            onChange={(e) => setIngredient(e.value)} 
                            checked={ingredient === 'All'} 

                        />
                        <label htmlFor="ingredient1" className="ms-2">Generate for All</label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton 
                            inputId="ingredient2" 
                            name="one" 
                            value="One" 
                            onChange={(e) => setIngredient(e.value)} 
                            checked={ingredient === 'One'} 
                        />
                        <label htmlFor="ingredient2" className="ms-2">Generate for One</label>
                    </div>
                </div>
                <div className="mt-4">
                    {ingredient === 'One' && (
                        <div className="">
                            <label className="font-bold block mb-2">Select Employee <sup className='text-danger'>*</sup></label>
                            <AutoComplete 
                                value={value} 
                                suggestions={items} 
                                completeMethod={search} 
                                onChange={(e) => setValue(e.value)} 
                                className="w-100" 
                                required
                            />
                        </div>
                    )}
                    <div className="mt-2">
                        <label className="font-bold block mb-2">Select Month <sup className='text-danger'>*</sup></label>
                        <Calendar 
                            value={date} 
                            onChange={(e) => setDate(e.value)} 
                            view="month" 
                            dateFormat="mm/yy" 
                            required
                        />
                    </div>
                    <div className="w-100 mt-2">
                        <label className="font-bold block mb-2">Total Working Days <sup className='text-danger'>*</sup></label>
                        <InputNumber 
                            value={value1} 
                            onValueChange={(e) => setValue1(e.value)} 
                            className="w-100" 
                            required
                        />
                    </div>
                    
                    <Row className="mt-2">
                        <Col md={6} lg={6} className="mb-3">
                            <label className="font-bold block mb-2">PF <small>(%)</small><sup className='text-danger'>*</sup></label>
                            <InputNumber inputId="percent" onValueChange={(e) => setValue2(e.value)} suffix="%" required />
                        </Col>
                        <Col md={6} lg={6} className="mb-3">
                            <label className="font-bold block mb-2">ESI <small>(%)</small><sup className='text-danger'>*</sup></label>
                            <InputNumber inputId="percent" onValueChange={(e) => setValue2(e.value)} suffix="%" required />
                        </Col>
                        {/* <Col md={6} lg={6} className="mb-3">
                            <label className="font-bold block mb-2">P TAX <small>(%)</small></label>
                            <InputNumber inputId="percent" value={0.5} onValueChange={(e) => setValue2(e.value)} suffix="%" />
                        </Col> */}
                        <Col md={6} lg={6} className="mb-3">
                            <label className="font-bold block mb-2">TDS <small>(%)</small><sup className='text-danger'>*</sup></label>
                            <InputNumber inputId="percent" onValueChange={(e) => setValue2(e.value)} suffix="%" required/>
                        </Col>
                    </Row>
                </div>
                <div className='d-flex justify-content-end mt-3'>
                    <Button
                        label="Generate"
                        icon="pi pi-check"
                        className="border-0 py-2 px-3"
                        severity='help'
                        loading={loading} 
                        onClick={load}
                    />
                </div>
            </Form>
        </>
        );
    };
    export default Generate_payslip;