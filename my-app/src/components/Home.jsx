import React from "react";

const Home = () => {
    return (
        <>
            <div className="container">
                <div className="row p-5">
                    <div className="col-5">
                        <img src="/consistent-logo.png" alt="logo" width="350" />
                    </div>
                    <div className="col-7">
                        <div className="card border-0 shadow">
                            <div className="card-body">
                                <div className="mt-4">
                                    <blockquote className="blockquote">
                                        <p className="mb-3 fs-3 text-muted">
                                            "Success is not final, failure is not fatal: it is the courage to continue that counts.
                                            Track your habits, manage your tasks, and watch how small daily actions compound into
                                            extraordinary results over time."
                                        </p>
                                        <footer className="blockquote-footer text-end">
                                            <cite title="Source Title">Winston Churchill</cite>
                                        </footer>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;