import React, { useState } from 'react';
import JobApplicationPopup from './JobApplicationPopup'; // Importing the JobApplicationPopup component
import "./JobListing.css";

const JobListing = (props) => {
    // State to control the visibility of the popup
    const [showPopup, setShowPopup] = useState(false);

    // Put a random day until we can get that information from the backend
    const daysPassed = Math.floor(Math.random() * 10) + 1;

    // Function to toggle the visibility of the popup
    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    return (
        <div className="row-lg-4 d-flex align-items-stretch">
            <div className="jlcard w-100">
                <div className="jlcard-body">
                    <h3 className="jlcard-title">{props.position ? props.position : "No position given"}</h3>
                    <h5>{props.company ? props.company : "No company given"} | <span className="text-muted">{props.location ? props.location : "No location given"}</span> </h5>
                    <div className="description">
                        <p className="jlcard-text">{props.description ? String(props.description).slice(0, 256) + "..." : "No description available"}</p>
                        <p className="jlcard-hover-text">{props.description ? props.description : "No description available"}</p>
                    </div>
                    {/* Apply button with onClick event handler */}
                    <button className="btn btn-primary p-2" type="button" onClick={togglePopup}>Apply</button>
                    {/* May have to alter logic if we are accounting for hours as well */}
                    <span className="p-2 text-secondary"> {daysPassed > 1 ? "Posted " + daysPassed + " Days Ago" : "Posted " + daysPassed + " Day Ago"}</span>
                </div>
            </div>
            {/* Conditionally render the popup based on showPopup state */}
            {showPopup && <JobApplicationPopup onClose={togglePopup} />}
        </div>
    );
};

export default JobListing;
