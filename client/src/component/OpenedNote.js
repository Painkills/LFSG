import React from 'react'
import './OpenedNote.css'

function OpenedNote(props) {
    return (props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <button className="close-btn">close</button>
                { props.children }
            </div>
        </div>
    ) : "";
}

export default OpenedNote