#!/usr/bin/env python3
"""
Question Bank Generator for Distribution Solver.
Generates exactly 100 rich, realistic, curated word problems for each of the 6 distributions:
- Binomial (100)
- Poisson (100)
- Normal (100)
- Exponential (100)
- Gamma (100)
- Weibull (100)
Total: 600 questions saved to src/data/question_bank.json.
"""

import json
import os

def create_binomial_questions():
    questions = []
    
    categories = [
        ("Quality Control & Manufacturing", [
            ("Printed Circuit Board Solder Defects", "A surface-mount assembly line inspects a sample of {n} printed circuit boards. The probability of success of finding a defective board is {p}.", "defective boards"),
            ("Automotive Brake Pad Tolerance Check", "An automated robotic cell inspects {n} trials of newly molded brake pads. Each pad has a probability of success of {p} of exceeding thickness tolerances.", "out-of-spec pads"),
            ("Lithium-Ion Battery Cell Inspection", "In a gigafactory quality check, technicians test a sample of {n} battery cells. The chance of being defective on each trial is {p}.", "faulty cells"),
            ("Pharmaceutical Tablet Weight Consistency", "A pharmaceutical compression press samples {n} tablets from a production batch. The probability of success of finding an underweight tablet is {p}.", "underweight tablets"),
            ("Fiber-Optic Cable Connector Verification", "Quality engineers test a sample of {n} fiber connectors. Each connector has a probability of success of {p} of exhibiting optical insertion loss above 0.2 dB.", "high-loss connectors"),
            ("Ball Bearing Micro-Fracture Scanning", "An ultrasonic scanner checks {n} precision ball bearings. The chance of being defective on each trial is {p}.", "fractured bearings"),
            ("Smartphone OLED Display Pixel Check", "Display panels undergo automated optical testing across {n} trials. The probability of success of finding a cluster of dead pixels is {p}.", "failed displays"),
            ("Aerospace Fastener Tensile Testing", "Metallurgical inspectors test {n} titanium alloy bolts. The probability of success of a bolt yielding below specification is {p}.", "non-conforming bolts"),
            ("Solar Photovoltaic Micro-Crack Auditing", "Electroluminescence imaging inspects a sample of {n} silicon solar wafers with a probability of success of {p} of identifying micro-cracks.", "cracked wafers"),
            ("Injection-Molded Medical Syringe Luer Lock Check", "An automated vision station verifies {n} medical syringes. The probability of success of detecting a flashing defect is {p}.", "defective syringes"),
        ]),
        ("Medical Diagnostics & Clinical Trials", [
            ("Novel Oncology Immunotherapy Efficacy", "In an experimental clinical trial, an oncologist administers an immunotherapy agent to a sample of {n} patients. The probability of success of tumor remission on each trial is {p}.", "patients achieving remission"),
            ("Rapid Point-of-Care Antigen Sensitivity", "A clinic validates a rapid lateral-flow antigen test with a sample of {n} confirmed virus cases. The probability of success of detecting true positive infection is {p}.", "positive test results"),
            ("Cardiovascular Stent Restenosis Rate", "A multi-center cardiology study monitors {n} patients receiving drug-eluting coronary stents. The probability of success of restenosis within one year is {p}.", "restenosis cases"),
            ("Pediatric Vaccine Seroconversion", "A pediatric immunization clinic tracks {n} infants receiving a newly formulated booster. The probability of success of producing protective antibody titers is {p}.", "seroconverted infants"),
            ("Post-Surgical Infection Prophylaxis", "A surgical ward audits {n} patients receiving prophylactic antibiotic therapy. The probability of success of preventing surgical site infection is {p}.", "infection-free recoveries"),
            ("Genetic Screening for Familial Hypercholesterolemia", "A genetics laboratory analyzes DNA samples from {n} patients with early cardiovascular disease. The probability of success of identifying a pathogenic LDLR mutation is {p}.", "identified mutation carriers"),
            ("Glaucoma Intraocular Pressure Reduction", "An ophthalmology trial treats a sample of {n} patients with a novel prostaglandin analog eye drop. The probability of success of reducing pressure by 30% is {p}.", "successful pressure reductions"),
            ("Orthopedic Joint Replacement Satisfaction", "An orthopedic registry tracks {n} total hip arthroplasty patients at 1-year follow-up. The probability of success of reporting complete pain alleviation is {p}.", "satisfied patients"),
            ("Diabetes Glycemic Control via SGLT2 Inhibitor", "Endocrinologists evaluate {n} patients with type 2 diabetes receiving oral SGLT2 therapy. The probability of success of reaching HbA1c below 7.0% is {p}.", "controlled diabetic patients"),
            ("Emergency Stroke Thrombolytic Intervention", "A stroke unit delivers intravenous alteplase to {n} acute ischemic stroke patients. The probability of success of achieving functional independence at 90 days is {p}.", "independent recoveries"),
        ]),
        ("Sports Analytics & Athletics", [
            ("NBA Point Guard Clutch Free Throws", "During a critical tournament series, a basketball point guard takes {n} free throws with a probability of success of {p}.", "successful free throws"),
            ("Professional Soccer Penalty Shootout Series", "A football striker takes {n} penalty kicks against a national goalkeeper. The probability of success of scoring a goal is {p}.", "scored goals"),
            ("Major League Baseball Batting Plate Appearances", "A professional baseball hitter steps up for {n} plate appearances across a homestand. The probability of success of recording a base hit is {p}.", "recorded hits"),
            ("Tennis ATP Tour First Serve In-Play Rate", "A professional tennis player attempts {n} first serves during a hardcourt match. The probability of success of landing the ball in the service box is {p}.", "successful first serves"),
            ("NFL Quarterback Third-Down Pass Completions", "A quarterback drops back for {n} third-down pass attempts with a probability of success of {p} of completing the pass.", "completed third-down passes"),
            ("Olympic Archery Bullseye Precision", "An Olympic archer releases {n} arrows at a 70-meter distance target. The probability of success of striking the gold center ring (10 points) is {p}.", "bullseye hits"),
            ("Golf PGA Tour Fairway Drive Accuracy", "A tour golfer hits {n} drives off the tee. The probability of success of landing cleanly on the fairway is {p}.", "fairway drives"),
            ("Ice Hockey Power-Play Goal Conversion", "An NHL hockey franchise executes {n} power-play opportunities with a probability of success of {p} of converting a goal.", "power-play goals"),
            ("Rugby Union Conversion Kick Precision", "A rugby fly-half attempts {n} conversion kicks from varying field angles with a probability of success of {p}.", "successful kicks"),
            ("Gymnastics Vault Routine Clean Landing", "An elite gymnastics team performs {n} vault rotations. The probability of success of sticking the landing without stepping is {p}.", "stuck landings"),
        ]),
        ("Telecommunications & Packet Transmission", [
            ("5G Wireless Millimeter-Wave Packet Delivery", "A mobile user equipment node sends {n} packets over a 5G mmWave uplink channel. The probability of success of packet delivery without retransmission is {p}.", "delivered packets"),
            ("Satellite Low-Earth-Orbit Uplink Frame Errors", "A ground satellite terminal transmits a sequence of {n} telemetry frames. The chance of being defective due to atmospheric attenuation is {p}.", "corrupted telemetry frames"),
            ("Deep-Space Optical Laser Communications", "A lunar orbiter transmits a block of {n} photon pulse code words. The probability of success of decoding each codeword error-free is {p}.", "decoded codewords"),
            ("Wi-Fi 7 Multi-Link Operation Contention", "A router attempts {n} transmission burst trials across bonded channels with a probability of success of {p} of securing a clear channel assessment.", "successful channel accesses"),
            ("Data Center Fibre Channel Packet Loss", "A storage area network transmits {n} frames through high-density switches. The chance of being defective on each trial is {p}.", "dropped storage frames"),
            ("Submarine Undersea Optical Cable Transmissions", "A transatlantic fiber repeater station amplifies {n} optical signal frames with a probability of success of {p} of maintaining optical signal-to-noise ratio.", "clean optical frames"),
            ("Bluetooth Low Energy Sensor Beacon Broadcasts", "An industrial IoT temperature sensor transmits {n} advertising beacons with a probability of success of {p} of receipt by the central hub.", "received beacon packets"),
            ("Voice-over-IP UDP Packet Delivery", "A VoIP softphone stream transmits a buffer of {n} audio voice packets with a probability of success of {p} of arriving within jitter limits.", "jitter-free voice packets"),
            ("Ethernet Collision Domain Contention", "In a legacy Ethernet segment, a station initiates {n} frame transmissions with a probability of success of {p} of avoiding collision.", "collision-free frames"),
            ("Mesh Wireless Sensor Network Routing Hops", "A remote environmental monitoring sensor initiates {n} multi-hop packet transmissions with a probability of success of {p} of reaching the root gateway.", "routed sensor packets"),
        ]),
        ("Sales, E-commerce & Marketing", [
            ("Enterprise Software B2B Cold Outreach", "A sales development representative makes a sample of {n} cold calls to Chief Technology Officers. The probability of success of securing a qualified demonstration meeting is {p}.", "scheduled meetings"),
            ("E-Commerce Abandoned Cart Recovery Campaign", "An online retail platform sends automated email discount codes to {n} shoppers who abandoned their cart. The probability of success of completing the checkout is {p}.", "recovered purchases"),
            ("Targeted Social Media Ad Impression Conversions", "A digital marketer tracks a cohort of {n} targeted users who clicked a sponsored Instagram promotion. The probability of success of signing up for a trial is {p}.", "trial conversions"),
            ("SaaS Customer Subscription Annual Renewal", "An enterprise cloud vendor contacts a cohort of {n} corporate accounts up for annual contract renewal. The probability of success of renewing the subscription is {p}.", "renewed contracts"),
            ("Direct Mail Catalog Holiday Purchases", "A luxury catalog distributor delivers promotional seasonal booklets to {n} households. The probability of success of placing an order is {p}.", "placed orders"),
            ("Webinar Attendee Product Purchase Upsell", "A software platform hosts an educational webinar with {n} active participants. The probability of success of upgrading to a paid tier post-event is {p}.", "upgraded accounts"),
            ("Customer Referral Program Activation", "A mobile banking app sends referral bonuses to {n} existing active users. The probability of success of successfully inviting a new depositor is {p}.", "active referrals"),
            ("Search Engine Sponsored Keyword Click Conversions", "An agency monitors {n} clicks on high-intent Google search advertisements. The probability of success of converting into a paid booking is {p}.", "paid bookings"),
            ("Retail Store Loyalty Card Enrollment", "Cashiers at an electronics retail store invite a sample of {n} shoppers to enroll in the VIP rewards club. The probability of success of enrolling is {p}.", "rewards club enrollments"),
            ("Flash Sale Limited-Time Coupon Redemption", "A food delivery marketplace pushes push notifications with discount coupons to {n} dormant accounts. The probability of success of ordering within 24 hours is {p}.", "redeemed coupons"),
        ]),
        ("Educational Testing & Multiple Choice", [
            ("Medical Board Licensing Examination Guessing", "A medical student encounters an exam with {n} questions where answers are guessed purely at random. The probability of success of guessing each question correctly is {p}.", "correctly guessed questions"),
            ("Aviation Instrument Rating Flight Theory Exam", "A pilot candidate answers an exam with {n} multiple-choice navigation questions. The probability of success of selecting the right response is {p}.", "correct answers"),
            ("Bar Examination Legal Ethics Assessment", "Law students sit for an exam with {n} questions on statutory legal ethics. For an unprepared candidate guessing randomly, the probability of success on each trial is {p}.", "correct responses"),
            ("Actuarial Financial Mathematics Multiple Choice", "An actuarial candidate sits for an exam with {n} questions. The candidate has a probability of success of {p} of solving each challenging quantitative problem.", "solved problems"),
            ("Secondary School Biology Standardized Quiz", "High school seniors complete a standardized biology test having an exam with {n} questions. The probability of success of getting each question right is {p}.", "correct answers"),
            ("Certified Information Systems Security Professional Test", "A cybersecurity analyst takes a certification exam with {n} scenario questions. The probability of success of passing each scenario item is {p}.", "passed scenarios"),
            ("Foreign Language Vocabulary Recognition Assessment", "Language students take an exam with {n} questions assessing idiomatic expressions. The probability of success of choosing the right synonym is {p}.", "correct vocabulary answers"),
            ("University Calculus Diagnostic Multiple Choice", "Freshman engineering students take a placement exam with {n} questions. The probability of success of solving each calculus problem is {p}.", "correctly answered questions"),
            ("Commercial Driver License Traffic Sign Test", "Truck driver applicants answer an exam with {n} questions regarding commercial traffic laws. The probability of success of answering correctly is {p}.", "correct answers"),
            ("Elementary School Spelling Bee Elimination Rounds", "Spelling contestants participate in a contest across {n} trials of challenging words. A contestant has a probability of success of {p} of spelling each word correctly.", "correctly spelled words"),
        ]),
        ("Finance, Auditing & Fraud Detection", [
            ("Credit Card Suspicious Transaction Auditing", "A banking compliance team samples {n} transactions flagged by algorithmic risk heuristics. The probability of success of identifying genuine unauthorized fraud is {p}.", "fraudulent transactions"),
            ("Mortgage Loan Application Underwriting Sampling", "Bank regulators audit a random sample of {n} approved residential mortgages. The probability of success of discovering documentation non-compliance is {p}.", "non-compliant loans"),
            ("Internal Revenue Service Tax Return Audit", "Tax auditors examine a sample of {n} corporate tax returns in the high-wealth bracket. The probability of success of finding substantial underreported deductions is {p}.", "audited adjustments"),
            ("Commercial Bank Commercial Loan Default Rate", "A regional credit union issues a portfolio of {n} small-business commercial loans. The probability of success of loan default within three years is {p}.", "defaulted loans"),
            ("Securities Trading Anti-Money Laundering Review", "A brokerage surveillance engine flags {n} high-volume equity trades. The probability of success of an alert leading to a Suspicious Activity Report is {p}.", "SAR escalation cases"),
            ("Travel & Expense Corporate Reimbursement Audit", "An internal forensic auditor examines {n} employee travel expense reports. The probability of success of finding unsubstantiated personal expenses is {p}.", "disallowed expense reports"),
            ("Cryptocurrency Wallet Address Sanction Screening", "A digital asset exchange screens {n} incoming deposit transactions against sanction watchlists. The probability of success of flagging a sanctioned wallet is {p}.", "flagged deposits"),
            ("Peer-to-Peer Micro-Lending Repayment", "A fintech lending platform finances {n} peer-to-peer micro-loans. The probability of success of full timely repayment is {p}.", "fully repaid loans"),
            ("Municipal Bond Issuance Credit Rating Downgrade", "An investment fund holds {n} municipal infrastructure bonds. The probability of success of any individual bond being downgraded within 5 years is {p}.", "downgraded bonds"),
            ("Healthcare Insurance Billing Code Anomaly Check", "A medical insurer audits a sample of {n} surgical claim submissions. The probability of success of detecting upcoding anomalies is {p}.", "upcoded claims"),
        ]),
        ("Software Engineering & CI/CD Testing", [
            ("Continuous Integration Pipeline Flaky Test Detection", "A developer team runs {n} automated test suite runs on an asynchronous test runner. The chance of being defective due to test flakiness is {p}.", "flaky test failures"),
            ("Microservice REST API Health Check Pings", "A Kubernetes orchestrator conducts {n} HTTP health-check probes across service replicas. The probability of success of receiving a healthy 200 OK status is {p}.", "successful health checks"),
            ("Distributed Database Consensus Ping Acknowledgments", "A Raft consensus leader broadcasts {n} heartbeat messages to replica nodes. The probability of success of receiving an immediate quorum acknowledgment is {p}.", "acknowledged heartbeats"),
            ("Automated Penetration Test Vulnerability Exploits", "A security scanner executes {n} web vulnerability attack vectors against a staging endpoint. The probability of success of identifying an unpatched injection vulnerability is {p}.", "discovered vulnerabilities"),
            ("Mobile Application App Store Crash-Free Sessions", "Telemetry logs record a sample of {n} user app launch sessions. The probability of success of a session terminating without a crash is {p}.", "crash-free sessions"),
            ("Static Code Analysis Dependency Vulnerability Flagging", "A dependency scanner inspects {n} open-source package imports in a monorepo. The chance of being defective with critical CVE vulnerabilities is {p}.", "vulnerable libraries"),
            ("Cloud Lambda Serverless Function Cold Starts", "An event-driven backend invokes {n} serverless function executions. The probability of success of experiencing a cold start latency penalty is {p}.", "cold start executions"),
            ("GraphQL Query Response Cache Hit Ratio", "An edge CDN gateway handles {n} incoming GraphQL query requests. The probability of success of serving from memory cache is {p}.", "cached responses"),
            ("Database Connection Pool Acquisition Success", "A high-concurrency microservice requests {n} pooled PostgreSQL connections. The probability of success of acquiring an idle connection without timeout is {p}.", "acquired connections"),
            ("Docker Container Image Layer Build Cache Hits", "A build bot executes {n} container image build steps. The probability of success of reusing cached intermediate filesystem layers is {p}.", "cache-hit build steps"),
        ]),
        ("Aviation & Transportation Logistics", [
            ("Commercial Airline On-Time Flight Arrivals", "A major carrier operates an audit sample of {n} domestic flights. The probability of success of an aircraft arriving within 15 minutes of schedule is {p}.", "on-time arrivals"),
            ("Airport Baggage Handling Transfer Delivery", "Baggage logistics handlers transfer a sample of {n} connecting passenger suitcases. The probability of success of baggage successfully reaching the connecting flight is {p}.", "delivered bags"),
            ("Air Traffic Control Instrument Runway Departures", "An airport control tower coordinates {n} peak-hour commercial departures. The probability of success of departing without ground delay is {p}.", "on-schedule departures"),
            ("Intermodal Freight Train Container Milestone Delivery", "A rail freight company tracks a sample of {n} shipping container movements across continental corridors. The probability of success of on-time delivery is {p}.", "on-time rail containers"),
            ("Urban Electric Bus Fleet Battery Availability", "A municipal transit agency deploys {n} electric buses during morning rush hour. The probability of success of a bus having sufficient charge for the full route is {p}.", "route-ready buses"),
            ("Last-Mile Autonomous Delivery Drone Missions", "A logistics delivery company launches {n} autonomous delivery drone flights. The probability of success of completing delivery without operator intervention is {p}.", "autonomous deliveries"),
            ("Highway Commercial Truck Weight Enforcement", "Highway patrol monitors a weigh station where a sample of {n} commercial trucks are screened. The probability of success of finding an overweight axle load is {p}.", "overweight trucks"),
            ("Harbor Cargo Crane Container Moves per Hour", "A container seaport operates {n} gantry crane container lift trials. The probability of success of executing a lift cycle in under 90 seconds is {p}.", "rapid container moves"),
            ("Ride-Sharing Driver Arrival Time Accuracy", "A ride-hailing platform tracks a sample of {n} passenger trip pickups. The probability of success of the driver arriving within the estimated pickup window is {p}.", "punctual pickups"),
            ("Commercial Aircraft Pre-Flight Maintenance Inspection", "Aircraft mechanics conduct pre-flight safety inspections across {n} flights. The chance of being defective with a maintenance snag requiring delay is {p}.", "delayed aircraft snags"),
        ]),
        ("Customer Service & User Feedback", [
            ("Call Center First-Contact Resolution Rate", "A telecom customer support center handles a sample of {n} customer inquiries. The probability of success of resolving the issue on the first contact is {p}.", "resolved inquiries"),
            ("Net Promoter Score Brand Advocate Surveys", "A consumer software company surveys {n} registered users. The probability of success of an individual responding as a promoter is {p}.", "promoter responses"),
            ("E-Commerce Product Return Request Rate", "A fashion e-tailer ships an order batch of {n} items of clothing. The chance of being defective or returned by the buyer is {p}.", "returned apparel items"),
            ("Online Banking Mobile App Rating Reviews", "An app store listing receives a sample of {n} user reviews. The probability of success of a review rating 5 stars is {p}.", "five-star reviews"),
            ("Hotel Guest Breakfast Service Satisfaction", "A luxury resort interviews {n} hotel guests regarding their dining experience. The probability of success of a guest expressing complete satisfaction is {p}.", "satisfied diners"),
            ("Software Live Chat Help Desk Availability", "A SaaS help portal logs {n} incoming live chat requests. The probability of success of connecting with a human agent within 60 seconds is {p}.", "instant connections"),
            ("Retail Store Extended Warranty Purchase Rate", "Electronics store cashiers offer extended warranties to {n} appliance customers. The probability of success of a customer purchasing the warranty is {p}.", "purchased warranties"),
            ("Airline Passenger Flight Rebooking Satisfaction", "An airline customer care desk assists {n} passengers affected by weather cancellations. The probability of success of successfully rebooking within 4 hours is {p}.", "rebooked passengers"),
            ("Restaurant Home Delivery Food Temperature Check", "A restaurant delivery chain audits {n} delivered orders. The probability of success of food arriving above the required 60°C is {p}.", "piping hot meals"),
            ("Subscription Box Customer Retention Rate", "A monthly subscription service tracks a sample of {n} members after 6 months. The probability of success of remaining an active subscriber is {p}.", "retained subscribers"),
        ])
    ]

    q_idx = 1
    # 10 categories, each has 10 templates. For each template we choose parameters and query style
    for cat_name, templates in categories:
        for t_idx, (title, premise, item_noun) in enumerate(templates):
            # Deterministic, realistic parameters for each index
            n_vals = [10, 15, 20, 25, 30, 40, 50, 60, 80, 100]
            p_vals = [0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.60, 0.75, 0.85, 0.90]
            
            n = n_vals[t_idx % len(n_vals)]
            p = p_vals[(t_idx + q_idx) % len(p_vals)]
            
            # Rotate query types across items:
            # 0: at least
            # 1: at most
            # 2: exactly
            # 3: more than
            # 4: fewer than
            # 5: between
            # 6: at least
            # 7: at most
            # 8: exactly
            # 9: between
            q_mode = t_idx % 6
            premise_text = premise.format(n=n, p=p)
            
            expected_val = round(n * p)
            if q_mode == 0:
                k = max(1, expected_val - 1)
                q_text = f"Assume a Binomial distribution. {premise_text} What is the probability of at least {k} {item_noun}?"
                query = {"type": "prob_greater_equal", "x": k}
                diff = "Intermediate"
            elif q_mode == 1:
                k = min(n - 1, expected_val + 2)
                q_text = f"Assume a Binomial distribution. {premise_text} What is the probability of at most {k} {item_noun}?"
                query = {"type": "prob_less_equal", "x": k}
                diff = "Basic"
            elif q_mode == 2:
                k = expected_val
                q_text = f"Assume a Binomial distribution. {premise_text} What is the probability of exactly {k} {item_noun}?"
                query = {"type": "prob_equal", "x": k}
                diff = "Basic"
            elif q_mode == 3:
                k = max(0, expected_val - 2)
                q_text = f"Assume a Binomial distribution. {premise_text} What is the probability of more than {k} {item_noun}?"
                query = {"type": "prob_greater", "x": k}
                diff = "Intermediate"
            elif q_mode == 4:
                k = min(n, expected_val + 3)
                q_text = f"Assume a Binomial distribution. {premise_text} What is the probability of fewer than {k} {item_noun}?"
                query = {"type": "prob_less", "x": k}
                diff = "Intermediate"
            else:
                a = max(0, expected_val - 2)
                b = min(n, expected_val + 2)
                if a >= b:
                    a = 0
                    b = max(1, a + 2)
                q_text = f"Assume a Binomial distribution. {premise_text} What is the probability of between {a} and {b} {item_noun}?"
                query = {"type": "prob_interval", "a": a, "b": b}
                diff = "Advanced"

            questions.append({
                "id": f"binom-{q_idx:03d}",
                "distribution": "binomial",
                "category": cat_name,
                "difficulty": diff,
                "title": title,
                "question": q_text,
                "params": {"size": n, "prob": p},
                "query": query
            })
            q_idx += 1
            
    return questions


def create_poisson_questions():
    questions = []
    
    categories = [
        ("Call Centers & Customer Support", [
            ("Financial Banking Telephone Hotline", "Incoming customer calls arrive at a banking support center according to a Poisson process with an average rate of {lam} calls per hour.", "calls"),
            ("Healthcare Telehealth Triage Inquiries", "A regional telehealth helpline receives incoming patient triage requests at an average rate of {lam} calls per hour following a Poisson distribution.", "triage requests"),
            ("SaaS Cloud Platform Technical Support Queue", "Customer escalation tickets arrive at a SaaS helpdesk with an average rate of {lam} tickets per hour according to a Poisson distribution.", "tickets"),
            ("Automotive Roadside Breakdown Assistance", "An automobile roadside dispatch desk receives emergency calls at an average rate of {lam} calls per hour according to a Poisson process.", "breakdown calls"),
            ("Airline Flight Booking Modification Desk", "An international airline reservation desk receives change requests at an average rate of {lam} calls per hour according to a Poisson distribution.", "rebooking calls"),
            ("E-Commerce Live Chat Order Inquiries", "An e-commerce marketplace handles incoming live chat customer inquiries with an average rate of {lam} inquiries per hour following a Poisson process.", "chat inquiries"),
            ("Municipal Public Works Emergency Hotline", "City water and power services receive burst pipe reports at an average rate of {lam} calls per hour according to a Poisson distribution.", "emergency calls"),
            ("Hospital Poison Control Advisory Hotline", "A regional poison information center receives urgent inquiries at an average rate of {lam} calls per hour according to a Poisson process.", "poison inquiries"),
            ("Telecommunications Fiber Outage Hotline", "An internet service provider experiences customer outage calls at an average rate of {lam} calls per hour following a Poisson process.", "reported outages"),
            ("Credit Card Stolen Card Emergency Reporting", "A fraud response call center logs emergency lost-card reports at an average rate of {lam} calls per hour according to a Poisson distribution.", "lost-card reports"),
        ]),
        ("Web Servers & Cloud Infrastructure", [
            ("High-Traffic API Gateway Request Spikes", "A microservices API gateway processes incoming authentication requests at an average rate of {lam} requests per second modeled as a Poisson process.", "requests"),
            ("Database Query Deadlock Occurrences", "A multi-node database cluster records transaction deadlock events at an average rate of {lam} deadlocks per hour according to a Poisson distribution.", "deadlocks"),
            ("Cloud Virtual Machine Preemption Events", "Spot instance virtual machines experience eviction notices at an average rate of {lam} evictions per day according to a Poisson distribution.", "eviction events"),
            ("Content Delivery Network Cache Misses", "An edge server in Tokyo logs cache miss requests at an average rate of {lam} misses per second following a Poisson process.", "cache misses"),
            ("DDoS Mitigation Engine Packet Scrubbing Alerts", "A network perimeter security engine flags anomalous volumetric packet floods at an average rate of {lam} alerts per hour according to a Poisson process.", "attack alerts"),
            ("Kubernetes Container Pod Restarts", "A containerized Kubernetes production cluster encounters unexpected pod restarts at an average rate of {lam} restarts per day according to a Poisson distribution.", "restarts"),
            ("Server Hard Drive SMART Reallocated Sectors", "A storage data center tracks failing enterprise hard drives recording bad sector reallocations at an average rate of {lam} errors per day according to a Poisson process.", "sector errors"),
            ("Payment Gateway Webhook Transmission Failures", "A financial processing cluster logs unacknowledged outbound webhooks at an average rate of {lam} failures per hour according to a Poisson distribution.", "failed webhooks"),
            ("Web Application Firewall SQL Injection Attempts", "A web security layer blocks malicious SQL injection payloads at an average rate of {lam} attacks per hour according to a Poisson process.", "blocked attacks"),
            ("Elasticsearch Cluster Document Indexing Queues", "An enterprise logging pipeline ingests bulk indexing requests at an average rate of {lam} requests per second according to a Poisson distribution.", "indexing batches"),
        ]),
        ("Hospital Emergency Rooms & Healthcare", [
            ("Urban Trauma Emergency Room Patient Arrivals", "Patients requiring urgent trauma care arrive at an urban emergency department at an average rate of {lam} patients per hour according to a Poisson process.", "trauma arrivals"),
            ("Cardiology Intensive Care Unit Admissions", "Acute myocardial infarction patients are admitted to a cardiac ICU at an average rate of {lam} admissions per day according to a Poisson distribution.", "ICU admissions"),
            ("Hospital Maternity Ward Delivery Admissions", "Mothers in active labor arrive at a regional maternity clinic at an average rate of {lam} deliveries per day according to a Poisson process.", "childbirth admissions"),
            ("Stroke Rehabilitation Center Patient Transfers", "Neurological recovery patients are referred to an acute rehab center at an average rate of {lam} patients per week according to a Poisson distribution.", "rehab referrals"),
            ("Pediatric Emergency Respiratory Treatments", "A pediatric hospital treats acute pediatric asthma exacerbations at an average rate of {lam} patients per day following a Poisson process.", "asthma emergencies"),
            ("Emergency Blood Bank O-Negative Transfusion Requests", "A regional blood transfusion center receives urgent uncrossmatched O-negative requests at an average rate of {lam} units per day according to a Poisson distribution.", "blood requests"),
            ("Organ Donor Procurement Coordinator Notifications", "A national transplant network receives potential organ donor notifications at an average rate of {lam} notifications per week according to a Poisson process.", "donor notifications"),
            ("Emergency Surgical Laparotomy Procedures", "An on-call acute surgical team performs emergency laparotomies at an average rate of {lam} operations per day according to a Poisson distribution.", "emergency surgeries"),
            ("Paramedic Helicopter Air-Ambulance Missions", "A medical flight service executes emergency trauma airlifts at an average rate of {lam} dispatches per day following a Poisson process.", "airlift missions"),
            ("Psychiatric Emergency Crisis Evaluations", "A mental health crisis center conducts urgent psychiatric evaluations at an average rate of {lam} cases per day according to a Poisson distribution.", "crisis evaluations"),
        ]),
        ("Traffic Engineering & Transportation", [
            ("Highway Toll Booth Vehicle Arrivals", "Motor vehicles arrive at an express automated electronic toll booth at an average rate of {lam} vehicles per minute according to a Poisson process.", "vehicles"),
            ("Airport Runway Commercial Jet Departures", "Commercial airliners are cleared for takeoff on runway 28L at an average rate of {lam} aircraft per hour according to a Poisson distribution.", "departures"),
            ("Subway Station Commuter Turnstile Swipes", "Metro passengers swipe through entry turnstiles during peak morning commute at an average rate of {lam} commuters per minute according to a Poisson process.", "turnstile swipes"),
            ("Urban Intersection Traffic Signal Vehicle Queue", "Automobiles approach an urban arterial intersection during a red phase at an average rate of {lam} cars per minute according to a Poisson distribution.", "approaching cars"),
            ("Harbor Canal Commercial Cargo Ship Transits", "Ocean freighters enter a narrow maritime shipping canal at an average rate of {lam} vessels per day according to a Poisson process.", "cargo ships"),
            ("Electric Vehicle Highway Supercharger Station Queue", "Long-distance electric vehicles arrive at an 8-stall charging plaza at an average rate of {lam} cars per hour according to a Poisson distribution.", "charging arrivals"),
            ("Freight Railway Locomotive Crossings", "Heavy cargo trains traverse a rural railway crossing at an average rate of {lam} trains per day according to a Poisson process.", "passing trains"),
            ("Bicycle Commuter Lane Corridor Traffic", "Cyclists enter a downtown segregated bike lane at an average rate of {lam} bicycles per minute according to a Poisson distribution.", "cyclists"),
            ("Airport Security Screening Checkpoint Queue", "Air travelers arrive at the TSA biometric screening checkpoint at an average rate of {lam} passengers per minute according to a Poisson process.", "travelers"),
            ("Interstate Highway Incident Dispatch Requests", "State highway patrol dispatches assistance for disabled vehicles at an average rate of {lam} incidents per day according to a Poisson distribution.", "incidents"),
        ]),
        ("Manufacturing Imperfections & Surface Defects", [
            ("Textile Weaving Mill Fabric Flaw Inspection", "An automated laser cloth scanner detects thread weave imperfections at an average rate of {lam} flaws per square meter following a Poisson process.", "surface flaws"),
            ("Float Glass Sheet Micro-Bubble Imperfections", "An architectural glass manufacturing furnace produces flat glass with an average rate of {lam} bubbles per square meter according to a Poisson distribution.", "air bubbles"),
            ("Precision Copper Foil Pinhole Contamination", "Electrolytic copper foil rolls used in battery anodes exhibit pinholes at an average rate of {lam} pinholes per square meter according to a Poisson process.", "pinholes"),
            ("Optical Fiber Draw Micro-Bending Attenuations", "Continuous optical telecommunication glass fiber experiences micro-defects at an average rate of {lam} defects per kilometer according to a Poisson distribution.", "fiber micro-defects"),
            ("Automotive Paint Shop Clear-Coat Blemishes", "A robotic vehicle paint booth records dust speck blemishes on newly painted car hoods at an average rate of {lam} blemishes per car hood according to a Poisson process.", "paint blemishes"),
            ("Semiconductor Silicon Wafer Particle Contamination", "A cleanroom inspection tool counts airborne sub-micron particles landing on silicon wafers at an average rate of {lam} particles per wafer according to a Poisson distribution.", "contaminant particles"),
            ("Steel Rolling Mill Surface Scratch Flaws", "Galvanized cold-rolled steel coils exhibit surface gouge scratches at an average rate of {lam} flaws per 100 meters according to a Poisson process.", "scratches"),
            ("Polymer Extrusion Pipe Wall Thickness Voids", "Ultrasonic sensors detect internal microscopic air voids in extruded HDPE pipelines at an average rate of {lam} voids per 10 meters according to a Poisson distribution.", "voids"),
            ("Solar Panel Anti-Reflective Coating Voids", "Quality cameras inspect chemical vapor deposition coatings on solar panels detecting pinhole voids at an average rate of {lam} voids per panel according to a Poisson process.", "coating voids"),
            ("Aircraft Aluminum Fuselage Rivet Misalignments", "Automated drill rigs inspect structural rivet installations on aircraft fuselage panels at an average rate of {lam} misalignments per panel according to a Poisson distribution.", "misalignments"),
        ]),
        ("Meteorology & Geophysics", [
            ("Seismic Fault Aftershock Tremor Frequency", "Following a major tectonic rupture, a geological sensor network detects minor aftershocks at an average rate of {lam} tremors per day according to a Poisson process.", "aftershocks"),
            ("Deep-Space Meteoroid Upper Atmosphere Entries", "An all-sky meteor camera observatory records bright fireball entries at an average rate of {lam} meteors per night according to a Poisson distribution.", "meteor fireballs"),
            ("Tropical Island Severe Hurricane Landfalls", "A Caribbean meteorological basin records major Category 4+ hurricanes making landfall at an average rate of {lam} storms per decade according to a Poisson process.", "hurricanes"),
            ("Geothermal Volcanic Micro-Earthquake Swarms", "Volcanologists monitoring an active caldera register subterranean magma fractures at an average rate of {lam} micro-quakes per hour according to a Poisson distribution.", "micro-earthquakes"),
            ("Mountain Meteorological Lightning Strike Density", "A forest lookout tower on an alpine summit detects cloud-to-ground lightning strikes at an average rate of {lam} strikes per hour according to a Poisson process.", "lightning strikes"),
            ("Solar Flare Coronal Mass Ejection Events", "A space weather monitoring satellite records significant X-class solar flare eruptions at an average rate of {lam} events per month according to a Poisson distribution.", "solar flares"),
            ("Tornado Alley Severe Funnel Touchdowns", "A county emergency management agency in Oklahoma records tornado touchdowns at an average rate of {lam} tornadoes per year according to a Poisson process.", "tornadoes"),
            ("Polar Aurora Borealis Geomagnetic Disturbances", "An arctic auroral observatory records coronal hole geomagnetic substorms at an average rate of {lam} storms per month according to a Poisson distribution.", "geomagnetic storms"),
            ("Desert Flash Flood Drainage Inundations", "A desert canyon wash hydrological station records flash flood surge occurrences at an average rate of {lam} floods per year according to a Poisson process.", "flash floods"),
            ("Oceanic Rogue Wave Height Anomalies", "A North Sea offshore oil platform wave buoy registers freak giant wave crests exceeding 15 meters at an average rate of {lam} waves per year according to a Poisson distribution.", "rogue waves"),
        ]),
        ("Retail Banking & Store Checkouts", [
            ("Supermarket Express Checkout Lane Customers", "Shoppers with under 10 items arrive at a grocery store express checkout at an average rate of {lam} customers per minute according to a Poisson process.", "customers"),
            ("High Street Bank Automated Teller Machine Withdrawals", "A busy downtown bank ATM registers cash withdrawal card insertions at an average rate of {lam} transactions per hour according to a Poisson distribution.", "transactions"),
            ("Fast-Food Drive-Thru Vehicle Ordering Intercom", "Hungry motorists pull up to a quick-service drive-thru intercom at an average rate of {lam} vehicles per 10 minutes according to a Poisson process.", "motorists"),
            ("Pharmacy Prescription Drop-Off Counter Arrivals", "Patients dropping off handwritten pharmaceutical scripts arrive at a community pharmacy at an average rate of {lam} patients per hour according to a Poisson distribution.", "patients"),
            ("Coffee Shop Morning Barista Order Placements", "Commuters ordering espresso beverages enter a downtown coffee shop at an average rate of {lam} customers per 5 minutes according to a Poisson process.", "coffee orders"),
            ("Department Store Customer Service Return Counter", "Shoppers requesting retail refunds or exchanges arrive at a department store customer service desk at an average rate of {lam} shoppers per hour according to a Poisson distribution.", "refund requests"),
            ("Post Office Parcel Mailing Window Queues", "Customers mailing stamped packages arrive at a postal service counter at an average rate of {lam} customers per hour according to a Poisson process.", "customers mailing packages"),
            ("Automated Self-Service Airport Baggage Drop", "Departing air passengers arrive at a robotic conveyor baggage drop kiosk at an average rate of {lam} passengers per minute according to a Poisson distribution.", "passengers"),
            ("Gasoline Fuel Station Pump Vehicle Arrivals", "Motorists pulling up to refuel at a highway service station arrive at an average rate of {lam} cars per hour according to a Poisson process.", "cars"),
            ("Ticket Kiosk Cinema Moviegoer Bookings", "Movie patrons arrive at automated cinema ticketing kiosks before an evening premiere at an average rate of {lam} moviegoers per 10 minutes according to a Poisson distribution.", "moviegoers"),
        ]),
        ("Biostatistics & Microbiology", [
            ("Hemocytometer Bacterial Colony Formation", "A microbiologist examines a diluted agar culture plate observing bacterial colonies growing at an average rate of {lam} colonies per square centimeter according to a Poisson distribution.", "colonies"),
            ("Radioactive Isotope Alpha Particle Decay Emissions", "A Geiger-Müller counter detects ionizing alpha particle emissions from an Americium-241 source at an average rate of {lam} particles per second according to a Poisson process.", "particle clicks"),
            ("CRISPR Genome Editing Off-Target Cleavages", "In a molecular biology assay, deep sequencing identifies off-target genomic cut sites at an average rate of {lam} mutations per genome according to a Poisson distribution.", "off-target mutations"),
            ("Airborne Viral Aerosol Plaque-Forming Units", "An environmental virology air sampler collects viable influenza viral particles at an average rate of {lam} plaque-forming units per cubic meter according to a Poisson process.", "viral units"),
            ("Erythrocyte Blood Smear Parasite Counts", "A pathologist inspecting a Giemsa-stained thin blood smear detects Plasmodium falciparum malaria ring forms at an average rate of {lam} parasites per high-power field according to a Poisson distribution.", "malaria parasites"),
            ("Microscopic Pollen Grain Atmospheric Allergen Sampler", "A volumetric spore trap monitoring seasonal airborne allergens counts ragweed pollen grains at an average rate of {lam} grains per cubic meter according to a Poisson process.", "pollen grains"),
            ("Yeast Cell Budding Scars in Microfluidic Channels", "Biologists tracking Saccharomyces cerevisiae cell divisions count budding scars at an average rate of {lam} scars per cell according to a Poisson distribution.", "bud scars"),
            ("Phage Plaque Assays on Bacterial Lawns", "A bacteriophage titration experiment on an Escherichia coli lawn reveals lysis clearing plaques at an average rate of {lam} plaques per petri dish according to a Poisson process.", "lysis plaques"),
            ("Polymerase Chain Reaction Spontaneous Base Substitutions", "Taq DNA polymerase incorporates spontaneous nucleotide errors during thermocycling at an average rate of {lam} mutations per 1000 base pairs according to a Poisson distribution.", "base substitutions"),
            ("Fluorescence In Situ Hybridization Gene Translocations", "Cytogeneticists inspecting bone marrow metaphase spreads detect chromosomal translocation breaks at an average rate of {lam} translocations per cell according to a Poisson process.", "translocations"),
        ]),
        ("Supply Chain & Warehouse Receiving", [
            ("Automated Fulfillment Center Dock Inbound Freight", "Long-haul freight trucks arrive at an Amazon regional fulfillment center receiving dock at an average rate of {lam} trucks per hour according to a Poisson process.", "inbound trucks"),
            ("Automated Guided Vehicle Pallet Fetch Missions", "Autonomous mobile robots in an automated warehouse receive pallet transport tasks at an average rate of {lam} missions per minute according to a Poisson distribution.", "robot missions"),
            ("Conveyor Belt Package Barcode Sorting Jams", "High-speed logistics parcel sorting conveyors experience package jams at an average rate of {lam} jams per hour according to a Poisson process.", "conveyor jams"),
            ("Air Cargo Freighter Freight Container Unloads", "An international air cargo hub unloads wide-body freight containers at an average rate of {lam} containers per hour according to a Poisson distribution.", "unloaded containers"),
            ("Cold-Chain Perishable Dairy Delivery Spacing", "Refrigerated milk transport tankers arrive at a commercial dairy pasteurization facility at an average rate of {lam} tankers per day according to a Poisson process.", "tankers"),
            ("Forklift Battery Recharging Bay Demands", "Electric warehouse forklifts pull into a central charging station for battery replacement at an average rate of {lam} forklifts per hour according to a Poisson distribution.", "forklifts"),
            ("Container Ship Unloading Gantry Crane Cycles", "A maritime terminal container crane transfers shipping containers onto railcars at an average rate of {lam} moves per hour according to a Poisson process.", "crane moves"),
            ("Hazardous Chemical Waste Shipment Dispatches", "An industrial manufacturing complex ships manifests of hazardous chemical solvent drums at an average rate of {lam} shipments per week according to a Poisson distribution.", "waste shipments"),
            ("Warehouse Picking Station SKU Replenishment Calls", "Stationary pickers trigger automated inventory bin replenishment requests at an average rate of {lam} requests per hour according to a Poisson process.", "replenishments"),
            ("Courier Fleet Van Package Dispatch Releases", "A delivery depot dispatches loaded route delivery vans into suburban neighborhoods at an average rate of {lam} vans per hour according to a Poisson distribution.", "dispatched vans"),
        ]),
        ("Print Publishing & Document Quality", [
            ("Newspaper Web Offset Press Typos", "An automated optical character verification scanner inspects printed newspaper plates detecting typographical errors at an average rate of {lam} errors per 100 pages according to a Poisson distribution.", "typographical errors"),
            ("Academic Manuscript Proofreading Footnote Glitches", "A university press copyeditor finds citation formatting inconsistencies at an average rate of {lam} errors per chapter according to a Poisson process.", "citation errors"),
            ("Commercial Book Printing Page Ink Smears", "A high-speed rotary printing press produces hardcover novels with ink smudges occurring at an average rate of {lam} smeared pages per 1000 copies according to a Poisson distribution.", "smudges"),
            ("Legal Contract Boilerplate Drafting Omissions", "A corporate legal compliance auditor audits standard nondisclosure agreements detecting clause drafting errors at an average rate of {lam} omissions per contract according to a Poisson process.", "omissions"),
            ("Digital Inkjet Large-Format Billboard Nozzle Clogs", "A wide-format outdoor advertising printer records clogged printhead nozzles at an average rate of {lam} clogs per day according to a Poisson distribution.", "clogged nozzles"),
            ("Currency Note Intaglio Printing Plate Flaws", "A government bureau of engraving inspects newly minted banknotes detecting micro-print plate imperfections at an average rate of {lam} flaws per sheet according to a Poisson process.", "plate flaws"),
            ("Braille Textbook Dot Height Embossing Errors", "An embossing press produces tactile Braille educational texts experiencing dot height deformities at an average rate of {lam} errors per 50 pages according to a Poisson distribution.", "embossing errors"),
            ("Packaging Carton Die-Cut Fold Misalignments", "A packaging converter folds corrugated shipping boxes with folding creases misaligned at an average rate of {lam} defects per 500 cartons according to a Poisson process.", "crease misalignments"),
            ("Passport Holographic Security Foil Scratches", "Quality control at a state identity printing facility detects microscopic scratch blemishes on passport laminates at an average rate of {lam} scratches per batch according to a Poisson distribution.", "scratches"),
            ("Technical Manual Schematic Wiring Symbol Errors", "An avionics engineering publication team reviews technical maintenance manuals detecting incorrect wiring diagram labels at an average rate of {lam} errors per manual according to a Poisson process.", "symbol errors"),
        ])
    ]

    q_idx = 1
    for cat_name, templates in categories:
        for t_idx, (title, premise, item_noun) in enumerate(templates):
            lam_vals = [2.0, 3.5, 5.0, 6.0, 8.0, 10.0, 12.5, 15.0, 20.0, 25.0]
            lam = lam_vals[(t_idx + q_idx) % len(lam_vals)]
            
            q_mode = t_idx % 6
            premise_text = premise.format(lam=lam)
            
            exp_val = round(lam)
            if q_mode == 0:
                k = max(1, exp_val - 2)
                q_text = f"{premise_text} What is the probability of at least {k} {item_noun}?"
                query = {"type": "prob_greater_equal", "x": k}
                diff = "Intermediate"
            elif q_mode == 1:
                k = exp_val + 2
                q_text = f"{premise_text} What is the probability of at most {k} {item_noun}?"
                query = {"type": "prob_less_equal", "x": k}
                diff = "Basic"
            elif q_mode == 2:
                k = exp_val
                q_text = f"{premise_text} What is the probability of exactly {k} {item_noun}?"
                query = {"type": "prob_equal", "x": k}
                diff = "Basic"
            elif q_mode == 3:
                k = max(0, exp_val - 1)
                q_text = f"{premise_text} What is the probability of more than {k} {item_noun}?"
                query = {"type": "prob_greater", "x": k}
                diff = "Intermediate"
            elif q_mode == 4:
                k = exp_val + 3
                q_text = f"{premise_text} What is the probability of fewer than {k} {item_noun}?"
                query = {"type": "prob_less", "x": k}
                diff = "Intermediate"
            else:
                a = max(0, exp_val - 2)
                b = exp_val + 3
                q_text = f"{premise_text} What is the probability of between {a} and {b} {item_noun}?"
                query = {"type": "prob_interval", "a": a, "b": b}
                diff = "Advanced"

            questions.append({
                "id": f"pois-{q_idx:03d}",
                "distribution": "poisson",
                "category": cat_name,
                "difficulty": diff,
                "title": title,
                "question": q_text,
                "params": {"lambda": lam},
                "query": query
            })
            q_idx += 1
            
    return questions


def create_normal_questions():
    questions = []
    
    categories = [
        ("Biological Anthropometry & Human Traits", [
            ("Adult Male Standing Stature in Millimeters", "Adult male standing stature follows a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "standing height in mm"),
            ("Adult Female Cranial Circumference", "Head circumference measurements of adult females follow a Normal distribution with a mean of {mu} cm and a standard deviation of {sd} cm.", "head circumference in cm"),
            ("Healthy Newborn Infant Birth Weight", "Full-term singleton infant birth weights follow a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "birth weight in grams"),
            ("Adult Resting Systolic Blood Pressure", "Resting systolic blood pressure among healthy young adults has a Normal distribution with a mean of {mu} mmHg and a standard deviation of {sd} mmHg.", "systolic pressure in mmHg"),
            ("Resting Human Core Body Temperature", "Oral clinical body temperature readings in healthy individuals follow a Normal distribution with a mean of {mu} °C and a standard deviation of {sd} °C.", "body temperature in °C"),
            ("Adult Resting Heart Rate Beats Per Minute", "Resting pulse rates in endurance runners follow a Normal distribution with a mean of {mu} bpm and a standard deviation of {sd} bpm.", "heart rate in bpm"),
            ("Serum Fasting Blood Glucose Concentration", "Fasting blood glucose levels among non-diabetic adults follow a Normal distribution with a mean of {mu} mg/dL and a standard deviation of {sd} mg/dL.", "glucose in mg/dL"),
            ("Adult Lung Total Forced Vital Capacity", "Pulmonary spirometry measurements of forced vital capacity in adult men follow a Normal distribution with a mean of {mu} liters and a standard deviation of {sd} liters.", "lung capacity in liters"),
            ("Blood Serum Total Cholesterol Levels", "Serum total cholesterol levels among healthy blood donors follow a Normal distribution with a mean of {mu} mg/dL and a standard deviation of {sd} mg/dL.", "cholesterol in mg/dL"),
            ("Human Visual Contrast Sensitivity Threshold", "Human spatial frequency visual contrast sensitivity scores follow a Normal distribution with a mean of {mu} units and a standard deviation of {sd} units.", "sensitivity score"),
        ]),
        ("Psychometrics & Standardized Testing", [
            ("Standardized Cognitive Intelligence Quotient", "Scores on the Wechsler Adult Intelligence Scale follow a Normal distribution with a mean of {mu} and a standard deviation of {sd}.", "IQ score points"),
            ("Graduate Record Exam Quantitative Reasoning", "Graduate Record Examination (GRE) quantitative scores follow a Normal distribution with a mean of {mu} and a standard deviation of {sd}.", "quantitative score"),
            ("Scholastic Aptitude Test (SAT) Math Section", "Nationwide SAT mathematics section test scores follow a Normal distribution with a mean of {mu} points and a standard deviation of {sd} points.", "SAT math points"),
            ("Medical College Admission Test (MCAT) Biological Sciences", "MCAT Biological and Biochemical Foundations section scaled scores follow a Normal distribution with a mean of {mu} and a standard deviation of {sd}.", "MCAT score"),
            ("Law School Admission Test (LSAT) Scaled Score", "Nationwide LSAT scaled exam scores follow a Normal distribution with a mean of {mu} and a standard deviation of {sd}.", "LSAT score points"),
            ("Employee Working Memory Capacity Digit Span", "Psychometric digit span working memory scores for tech employees follow a Normal distribution with a mean of {mu} items and a standard deviation of {sd} items.", "digit span memory"),
            ("Auditory Complex Reaction Time Latency", "Human auditory choice reaction times to sudden sound cues follow a Normal distribution with a mean of {mu} ms and a standard deviation of {sd} ms.", "reaction time in ms"),
            ("High School Standardized Reading Comprehension", "Statewide standardized secondary school reading comprehension scores follow a Normal distribution with a mean of {mu} points and a standard deviation of {sd} points.", "reading score"),
            ("Aviation Spatial Orientation Flight Aptitude", "Military pilot candidate spatial orientation exam scores follow a Normal distribution with a mean of {mu} points and a standard deviation of {sd} points.", "spatial aptitude score"),
            ("Certified Public Accountant (CPA) Auditing Section", "National CPA uniform examination auditing section scaled scores follow a Normal distribution with a mean of {mu} and a standard deviation of {sd}.", "CPA audit score"),
        ]),
        ("Precision Manufacturing & Component Tolerances", [
            ("Precision Steel Engine Crankshaft Diameter", "Precision CNC turned engine crankshaft bearing journals follow a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "shaft diameter in mm"),
            ("Electronic Carbon Film Resistor Resistance", "Nominal 100-ohm precision resistors manufactured on an automated line have electrical resistance following a Normal distribution with a mean of {mu} ohms and a standard deviation of {sd} ohms.", "resistance in ohms"),
            ("High-Tensile Aerospace Structural Bolt Length", "Grade-8 titanium alloy airframe bolts have an overall length following a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "bolt length in mm"),
            ("Silicon Wafer Chemical Mechanical Polishing Thickness", "Silicon semiconductor wafers post-polishing have a thickness following a Normal distribution with a mean of {mu} micrometers and a standard deviation of {sd} micrometers.", "wafer thickness in um"),
            ("Automotive Transmission Gear Pitch Diameter", "Spur gears machined for an electric vehicle transmission have a pitch diameter following a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "pitch diameter in mm"),
            ("Micro-Capacitor Dielectric Breakdown Voltage", "Ceramic surface-mount capacitors have a dielectric breakdown voltage following a Normal distribution with a mean of {mu} volts and a standard deviation of {sd} volts.", "breakdown voltage"),
            ("Hydraulic Piston Seal Internal Bore Clearance", "Heavy equipment hydraulic cylinders have an internal bore clearance following a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "bore clearance in mm"),
            ("Aircraft Turbine Blade Gap Clearance", "Aero-engine turbine blade shroud tip clearances follow a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "blade clearance in mm"),
            ("Printed Circuit Board Trace Etching Width", "Photolithographic etching of high-speed digital PCB copper traces yields trace widths following a Normal distribution with a mean of {mu} micrometers and a standard deviation of {sd} micrometers.", "trace width in um"),
            ("Laser Diode Optical Wavelength Emission", "Semiconductor distributed feedback laser diodes emit a central optical wavelength following a Normal distribution with a mean of {mu} nm and a standard deviation of {sd} nm.", "wavelength in nm"),
        ]),
        ("Food & Beverage Automated Packaging", [
            ("Automated Breakfast Cereal Net Weight Fill", "An automated auger filler packs boxes of crispy corn flakes with net fill weight following a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "cereal fill in grams"),
            ("Commercial Soda Can Carbonated Beverage Volume", "A high-speed bottling rotary line fills 355 mL aluminum cans with net liquid volume following a Normal distribution with a mean of {mu} mL and a standard deviation of {sd} mL.", "beverage volume in mL"),
            ("Gourmet Roasted Coffee Bean Bag Net Weight", "A specialty coffee roaster packs bags of single-origin beans with a net weight following a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "coffee weight in grams"),
            ("Dairy Milk Carton Pasteurization Fill Volume", "Paperboard one-liter fresh whole milk cartons are filled with liquid volume following a Normal distribution with a mean of {mu} mL and a standard deviation of {sd} mL.", "milk volume in mL"),
            ("Potato Chip Foil Pouch Packaging Weight", "A snack food manufacturer packages bags of crispy potato chips with net contents following a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "chip weight in grams"),
            ("Chocolate Confectionery Bar Wrapper Weight", "Artisan dark chocolate bars produced by a continuous molding depositor have weights following a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "chocolate bar weight in g"),
            ("Olive Oil Bottling Fill Volume Accuracy", "Extra virgin olive oil bottles are filled on a vacuum carousel with volume following a Normal distribution with a mean of {mu} mL and a standard deviation of {sd} mL.", "oil volume in mL"),
            ("Commercial Bakery Sliced Loaf Weight", "Freshly baked artisan sourdough bread loaves have weights following a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "bread loaf weight in g"),
            ("Frozen Prepared Meal Entree Caloric Content", "Laboratory assays of pre-packaged frozen gourmet entrees reveal caloric energy content following a Normal distribution with a mean of {mu} kcal and a standard deviation of {sd} kcal.", "calories in kcal"),
            ("Craft Beer Keg Commercial Fill Volume", "Half-barrel commercial craft beer stainless steel kegs are filled with volume following a Normal distribution with a mean of {mu} liters and a standard deviation of {sd} liters.", "beer volume in liters"),
        ]),
        ("Financial Portfolio Returns & Risk", [
            ("S&P 500 Daily Market Log-Return Variation", "Daily percentage logarithmic price returns for an S&P 500 index fund follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "daily return percentage"),
            ("Hedge Fund Monthly Alpha Return Generation", "A long/short equity market-neutral hedge fund generates monthly net returns following a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "monthly return percentage"),
            ("Government 10-Year Sovereign Bond Yield Shifts", "Daily basis point movements in 10-year Treasury sovereign bond yields follow a Normal distribution with a mean of {mu} bps and a standard deviation of {sd} bps.", "basis point changes"),
            ("Foreign Exchange EUR/USD Daily Fluctuations", "Daily percentage movements in the EUR/USD foreign exchange currency cross follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "forex movement %"),
            ("Commercial Bank Deposit Growth Quarter-over-Quarter", "Quarterly percentage growth rates in retail bank checking deposits follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "deposit growth %"),
            ("Commodity Gold Futures Daily Price Changes", "Daily percentage price movements for COMEX gold bullion futures contracts follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "gold price change %"),
            ("Corporate Investment-Grade Credit Spread Spacing", "Option-adjusted credit spreads for investment-grade corporate bonds follow a Normal distribution with a mean of {mu} bps and a standard deviation of {sd} bps.", "credit spread in bps"),
            ("Private Equity Fund Annualized IRR Performance", "Net internal rates of return (IRR) across buy-out private equity vintage funds follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "IRR percentage"),
            ("Real Estate Investment Trust (REIT) Annual Dividend Yield", "Annualized dividend yields among commercial healthcare REITs follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "dividend yield %"),
            ("Bitcoin Cryptographic Asset 24-Hour Return Volatility", "Daily percentage return fluctuations for Bitcoin spot markets follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "crypto return %"),
        ]),
        ("Climatology & Weather Phenomena", [
            ("Mid-Latitude Summer Maximum Daily Temperature", "Peak afternoon surface temperatures in July for a mid-latitude inland city follow a Normal distribution with a mean of {mu} °C and a standard deviation of {sd} °C.", "temperature in °C"),
            ("Annual Total Precipitation in Millimeters", "Total meteorological annual rainfall precipitation in a coastal temperate valley follows a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "rainfall in mm"),
            ("Synoptic Wind Velocity at 50-Meter Altitude", "Hourly sustained wind speed velocities measured by a coastal anemometer follow a Normal distribution with a mean of {mu} km/h and a standard deviation of {sd} km/h.", "wind speed in km/h"),
            ("Atmospheric Sea-Level Barometric Pressure", "Barometric air pressure readings recorded at sea level in an oceanic basin follow a Normal distribution with a mean of {mu} hPa and a standard deviation of {sd} hPa.", "barometric pressure in hPa"),
            ("Winter Mountain Seasonal Snowpack Accumulation", "Maximum winter seasonal snowpack depth measured at an alpine hydrological station follows a Normal distribution with a mean of {mu} cm and a standard deviation of {sd} cm.", "snowpack depth in cm"),
            ("Solar Photovoltaic Daily Insolation Irradiance", "Daily solar global horizontal solar irradiance reaching a desert solar park follows a Normal distribution with a mean of {mu} kWh/m2 and a standard deviation of {sd} kWh/m2.", "solar insolation"),
            ("Summer Afternoon Relative Humidity Percentage", "Afternoon ambient relative humidity readings in an agricultural river delta follow a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "humidity %"),
            ("Polar Sea Ice Maximum Extent Thickness", "End-of-winter arctic multi-year sea ice draft thickness follows a Normal distribution with a mean of {mu} meters and a standard deviation of {sd} meters.", "ice thickness in m"),
            ("Urban Air Quality Particulate Matter PM2.5", "Ambient 24-hour PM2.5 fine aerosol concentrations in a metropolitan center follow a Normal distribution with a mean of {mu} ug/m3 and a standard deviation of {sd} ug/m3.", "aerosol PM2.5 in ug/m3"),
            ("River Basin Peak Spring Melt Flood Discharge", "Peak spring snowmelt discharge rates on a mountain river follow a Normal distribution with a mean of {mu} m3/s and a standard deviation of {sd} m3/s.", "river discharge in m3/s"),
        ]),
        ("Structural Engineering & Material Strength", [
            ("Portland Ready-Mix Concrete 28-Day Compressive Strength", "Standard 28-day curing cylinder compressive strength of structural bridge concrete follows a Normal distribution with a mean of {mu} MPa and a standard deviation of {sd} MPa.", "compressive strength in MPa"),
            ("Structural Grade-50 Steel Rebar Yield Strength", "Tensile yield strength testing of ASTM A615 reinforcing steel rebar follows a Normal distribution with a mean of {mu} MPa and a standard deviation of {sd} MPa.", "yield strength in MPa"),
            ("Carbon-Fiber Reinforced Polymer Ultimate Tensile Limit", "Autoclave-cured aerospace carbon-fiber laminate coupons have ultimate tensile strength following a Normal distribution with a mean of {mu} MPa and a standard deviation of {sd} MPa.", "tensile limit in MPa"),
            ("Structural Timber Glulam Beam Modulus of Rupture", "Flexural bending rupture strength for Douglas fir architectural glulam beams follows a Normal distribution with a mean of {mu} MPa and a standard deviation of {sd} MPa.", "bending strength in MPa"),
            ("Suspension Bridge Galvanized Steel Wire Tensile Strength", "Individual galvanized high-carbon steel wires spun into suspension bridge main cables have breaking strength following a Normal distribution with a mean of {mu} kN and a standard deviation of {sd} kN.", "wire strength in kN"),
            ("Asphalt Pavement Dynamic Modulus Stiffness", "Hot-mix asphalt highway surface course samples have dynamic elastic modulus following a Normal distribution with a mean of {mu} GPa and a standard deviation of {sd} GPa.", "asphalt stiffness in GPa"),
            ("Prestressed Concrete Girder Strand Bond Strength", "Bond pull-out slip strength of seven-wire prestressing strands in bridge girders follows a Normal distribution with a mean of {mu} kN and a standard deviation of {sd} kN.", "strand pull-out in kN"),
            ("High-Strength Structural Epoxy Anchor Pull-Out Force", "Chemical adhesive epoxy anchors embedded in hardened rock have ultimate pull-out resistance following a Normal distribution with a mean of {mu} kN and a standard deviation of {sd} kN.", "anchor pull-out force in kN"),
            ("Structural Aluminum Alloy 6061-T6 Shear Strength", "Ultimate shear strength tests on heat-treated 6061-T6 structural aluminum gusset plates follow a Normal distribution with a mean of {mu} MPa and a standard deviation of {sd} MPa.", "shear strength in MPa"),
            ("Geotechnical Saturated Clay Soil Cohesion Shear Strength", "Undrained vane shear test cohesion values for marine foundation clay deposits follow a Normal distribution with a mean of {mu} kPa and a standard deviation of {sd} kPa.", "soil shear cohesion in kPa"),
        ]),
        ("Athletics & Human Performance", [
            ("Elite Marathon Footrace Finishing Time", "Finishing times for sub-elite competitive runners in a major city marathon follow a Normal distribution with a mean of {mu} minutes and a standard deviation of {sd} minutes.", "marathon time in minutes"),
            ("Track and Field Long Jump Competition Distance", "Official legal jump distances in collegiate long jump championships follow a Normal distribution with a mean of {mu} meters and a standard deviation of {sd} meters.", "jump distance in m"),
            ("Collegiate 100-Meter Sprint Dash Time", "Electronic timing for college sprinters competing in the 100-meter dash follows a Normal distribution with a mean of {mu} seconds and a standard deviation of {sd} seconds.", "sprint time in s"),
            ("Athletic High Jump Clearance Elevation", "Vertical bar clearance heights in elite decathlon high jump competitions follow a Normal distribution with a mean of {mu} meters and a standard deviation of {sd} meters.", "high jump height in m"),
            ("Freestyle 100-Meter Olympic Swimming Velocity", "Race completion times for varsity male swimmers in the 100-meter freestyle follow a Normal distribution with a mean of {mu} seconds and a standard deviation of {sd} seconds.", "swimming time in s"),
            ("Weightlifting Snatch Discipline Lift Weight", "Snatch lift achievements in national master weightlifting championships follow a Normal distribution with a mean of {mu} kg and a standard deviation of {sd} kg.", "lift weight in kg"),
            ("Baseball Pitcher Fastball Release Velocity", "Four-seam fastball pitch velocities recorded by radar Doppler units in Triple-A baseball follow a Normal distribution with a mean of {mu} mph and a standard deviation of {sd} mph.", "pitch velocity in mph"),
            ("Rowing 2000-Meter Ergometer Power Output", "Average power output in watts during a 2000-meter rowing ergometer assessment follows a Normal distribution with a mean of {mu} watts and a standard deviation of {sd} watts.", "ergometer power in watts"),
            ("Soccer Field Sprint Velocity Maximum Speed", "Peak GPS sprint velocities clocked by professional soccer wingers during matches follow a Normal distribution with a mean of {mu} km/h and a standard deviation of {sd} km/h.", "sprint speed in km/h"),
            ("Cyclist Functional Threshold Power (FTP)", "FTP endurance cycling power outputs measured in competitive road cyclists follow a Normal distribution with a mean of {mu} watts and a standard deviation of {sd} watts.", "threshold power in watts"),
        ]),
        ("Electrical Engineering & Semiconductor Physics", [
            ("MOSFET Transistor Gate Threshold Switching Voltage", "Sub-micron NMOS transistor gate threshold voltages on a 7nm silicon wafer follow a Normal distribution with a mean of {mu} volts and a standard deviation of {sd} volts.", "threshold voltage in V"),
            ("High-Voltage Power Transmission Frequency Deviations", "AC grid line frequency measured on an electrical synchronous interconnect follows a Normal distribution with a mean of {mu} Hz and a standard deviation of {sd} Hz.", "grid frequency in Hz"),
            ("Gallium Nitride (GaN) Power HEMT Saturation Current", "Saturation drain currents for wide-bandgap GaN power switching transistors follow a Normal distribution with a mean of {mu} amperes and a standard deviation of {sd} amperes.", "drain current in A"),
            ("Coaxial Transmission Line Characteristic Impedance", "High-frequency RF coaxial cables have characteristic electrical impedance following a Normal distribution with a mean of {mu} ohms and a standard deviation of {sd} ohms.", "impedance in ohms"),
            ("Lithium-Ion Battery Fully-Charged Open-Circuit Voltage", "Open-circuit cell voltages for newly assembled EV pouch battery cells follow a Normal distribution with a mean of {mu} volts and a standard deviation of {sd} volts.", "open-circuit voltage in V"),
            ("Clock Distribution Jitter Phase Noise in Microprocessors", "Phase jitter noise on high-frequency gigahertz CPU clock trees follows a Normal distribution with a mean of {mu} picoseconds and a standard deviation of {sd} picoseconds.", "phase jitter in ps"),
            ("Photodetector Avalanche Diode Dark Current", "Dark leakage currents in sensitive avalanche photodiodes used in LiDAR follow a Normal distribution with a mean of {mu} nanoamperes and a standard deviation of {sd} nanoamperes.", "dark current in nA"),
            ("Superconducting Quantum Qubit Coherence Frequency", "Qubit resonant transition frequencies measured across a 64-qubit quantum processor follow a Normal distribution with a mean of {mu} GHz and a standard deviation of {sd} GHz.", "qubit frequency in GHz"),
            ("High-Power Step-Down Transformer Efficiency Percentage", "Substation utility transformers exhibit full-load power transmission efficiency following a Normal distribution with a mean of {mu}% and a standard deviation of {sd}%.", "efficiency percentage"),
            ("Semiconductor Cleanroom Doping Sheet Resistance", "Four-point probe sheet resistance measurements on boron-doped silicon wafers follow a Normal distribution with a mean of {mu} ohms/sq and a standard deviation of {sd} ohms/sq.", "sheet resistance in ohms/sq"),
        ]),
        ("Agricultural Crop Yields & Animal Husbandry", [
            ("Winter Wheat Harvest Yield Per Acre in Bushels", "Commercial winter wheat harvests across a Midwest farming county follow a Normal distribution with a mean of {mu} bushels per acre and a standard deviation of {sd} bushels per acre.", "yield in bushels/acre"),
            ("Holstein Dairy Cow Daily Milk Production Volume", "Daily milk yields produced by mature Holstein dairy cows follow a Normal distribution with a mean of {mu} liters and a standard deviation of {sd} liters.", "milk yield in liters"),
            ("Commercial Grade-A Fresh Chicken Egg Weight", "Individual fresh chicken eggs sorted by an automated packaging conveyor have weights following a Normal distribution with a mean of {mu} grams and a standard deviation of {sd} grams.", "egg weight in grams"),
            ("Heirloom Apple Harvest Fruit Diameter", "Fuji apples harvested from an organic commercial orchard have equatorial fruit diameters following a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "apple diameter in mm"),
            ("Soybean Plant Pod Count Yield Per Acre", "Pod density counts per square meter on commercial agricultural soybean plots follow a Normal distribution with a mean of {mu} pods and a standard deviation of {sd} pods.", "pod count"),
            ("Feedlot Beef Cattle Finishing Live Weight", "Live weights of Angus steers arriving at finishing auction follow a Normal distribution with a mean of {mu} kg and a standard deviation of {sd} kg.", "steer weight in kg"),
            ("Vineyard Wine Grape Sugar Content in Brix", "Refractometer sugar concentration readings in Pinot Noir grapes during autumn harvest follow a Normal distribution with a mean of {mu} °Brix and a standard deviation of {sd} °Brix.", "sugar content in °Brix"),
            ("Broiler Chicken Market Slaughter Weight", "Live commercial broiler chickens after a 42-day growth cycle have weights following a Normal distribution with a mean of {mu} kg and a standard deviation of {sd} kg.", "chicken weight in kg"),
            ("Cotton Crop Fiber Staple Length in Millimeters", "Fiber staple lengths of harvested Upland cotton bales follow a Normal distribution with a mean of {mu} mm and a standard deviation of {sd} mm.", "staple length in mm"),
            ("Aquaculture Atlantic Salmon Harvest Mass", "Harvest weights of farmed Atlantic salmon reared in open ocean pens follow a Normal distribution with a mean of {mu} kg and a standard deviation of {sd} kg.", "salmon weight in kg"),
        ])
    ]

    q_idx = 1
    for cat_name, templates in categories:
        for t_idx, (title, premise, item_noun) in enumerate(templates):
            # Base numbers suitable for real-world scenarios
            mu_base = [100.0, 500.0, 75.0, 120.0, 25.0, 150.0, 30.0, 200.0, 50.0, 10.0]
            sd_base = [15.0, 50.0, 10.0, 15.0, 4.0, 20.0, 5.0, 25.0, 8.0, 2.0]
            
            mu = mu_base[(t_idx + q_idx) % len(mu_base)]
            sd = sd_base[(t_idx + q_idx) % len(sd_base)]
            
            q_mode = t_idx % 6
            premise_text = premise.format(mu=mu, sd=sd)
            
            if q_mode == 0:
                x = round(mu + 1.2 * sd, 1)
                q_text = f"{premise_text} What is the probability of at most {x}?"
                query = {"type": "prob_less_equal", "x": x}
                diff = "Basic"
            elif q_mode == 1:
                x = round(mu - 0.8 * sd, 1)
                q_text = f"{premise_text} What is the probability of at least {x}?"
                query = {"type": "prob_greater_equal", "x": x}
                diff = "Basic"
            elif q_mode == 2:
                x = round(mu + 1.5 * sd, 1)
                q_text = f"{premise_text} What is the probability of more than {x}?"
                query = {"type": "prob_greater", "x": x}
                diff = "Intermediate"
            elif q_mode == 3:
                x = round(mu - 1.2 * sd, 1)
                q_text = f"{premise_text} What is the probability of less than {x}?"
                query = {"type": "prob_less", "x": x}
                diff = "Intermediate"
            elif q_mode == 4:
                a = round(mu - 1.0 * sd, 1)
                b = round(mu + 1.0 * sd, 1)
                q_text = f"{premise_text} What is the probability of between {a} and {b}?"
                query = {"type": "prob_interval", "a": a, "b": b}
                diff = "Intermediate"
            else:
                pct = 95
                q_text = f"{premise_text} Find the {pct}th percentile."
                query = {"type": "find_x_for_p", "p": 0.95, "direction": "less_equal"}
                diff = "Advanced"

            questions.append({
                "id": f"norm-{q_idx:03d}",
                "distribution": "normal",
                "category": cat_name,
                "difficulty": diff,
                "title": title,
                "question": q_text,
                "params": {"mean": mu, "sd": sd},
                "query": query
            })
            q_idx += 1
            
    return questions


def create_exponential_questions():
    questions = []
    
    categories = [
        ("Hardware Reliability & Component Life", [
            ("Solid-State Drive (SSD) Operational Lifetime", "The operating lifetime of an enterprise server solid-state drive follows an Exponential distribution with a rate of {rate} per thousand hours.", "lifetime"),
            ("Industrial Robotic Servo Motor Continuous Life", "The operating time before breakdown of a robotic manufacturing servo arm follows an Exponential distribution with a rate of {rate} per month.", "operating time"),
            ("LED Industrial Floodlight Diode Longevity", "The time until burnout of an industrial LED luminaire has an Exponential distribution with a rate of {rate} per year.", "time until failure"),
            ("Lithium-Ion Battery Cycle Aging Longevity", "The operating life until battery capacity drops below 70% follows an Exponential distribution with a rate of {rate} per hundred cycles.", "battery life"),
            ("High-Voltage Circuit Breaker Arc Contact Life", "The time until contact pitting failure in a substation breaker follows an Exponential distribution with a rate of {rate} per thousand operations.", "operating life"),
            ("Centrifugal Water Pump Mechanical Seal Life", "The running time until coolant seal leakage follows an Exponential distribution with a rate of {rate} per thousand operating hours.", "running time"),
            ("Solar Photovoltaic Inverter Capacitor Lifespan", "The lifetime of electrolytic smoothing capacitors in a solar inverter follows an Exponential distribution with a rate of {rate} per year.", "capacitor lifespan"),
            ("High-Performance Server Fan Bearing Lifespan", "Cooling fan sleeve bearings in a rack server operate with an Exponential distribution with a rate of {rate} per thousand hours.", "bearing operating time"),
            ("Aircraft Auxiliary Power Unit Turbine Igniter", "The operating time between igniter plug burnouts on an aircraft APU follows an Exponential distribution with a rate of {rate} per flight hour.", "time between burnouts"),
            ("Fiber-Optic SFP+ Transceiver Laser Diode", "The time until laser degradation in an optical transceiver follows an Exponential distribution with a rate of {rate} per year.", "time until degradation"),
        ]),
        ("Service Counters & Queue Processing", [
            ("Retail Banking Teller Cash Withdrawal Duration", "The service time required for a bank teller to complete a cash transaction follows an Exponential distribution with a rate of {rate} customers per minute.", "service duration"),
            ("Fast-Food Drive-Thru Food Hand-Off Service Time", "The time taken to assemble and hand off an order at a drive-thru window follows an Exponential distribution with a rate of {rate} cars per minute.", "hand-off time"),
            ("Pharmacy Prescription Verification & Dispensing", "The service duration to verify and bag a prescription order follows an Exponential distribution with a rate of {rate} prescriptions per hour.", "dispensing time"),
            ("Airport Customs Passport Biometric Clearance", "The duration of border agent inspection per arriving traveler follows an Exponential distribution with a rate of {rate} passengers per minute.", "clearance time"),
            ("Customer Service Live Chat Resolution Time", "The duration an agent spends actively resolving a tier-1 customer chat follows an Exponential distribution with a rate of {rate} tickets per hour.", "resolution time"),
            ("Car Rental Counter Agreement Processing Time", "The service duration to inspect a driver license and issue keys follows an Exponential distribution with a rate of {rate} renters per hour.", "processing duration"),
            ("Coffee Barista Specialty Drink Preparation", "The time to steam milk and pull espresso for a specialty beverage follows an Exponential distribution with a rate of {rate} drinks per minute.", "preparation time"),
            ("Post Office Parcel Weighed Acceptance Time", "The time to weigh, print postage, and accept a customer parcel follows an Exponential distribution with a rate of {rate} packages per minute.", "acceptance time"),
            ("Urgent Care Triage Nurse Patient Evaluation", "The triage assessment time spent with a walk-in patient follows an Exponential distribution with a rate of {rate} patients per hour.", "triage duration"),
            ("Supermarket Deli Sliced Meat Slicing Duration", "The service time to weigh and package fresh deli cuts follows an Exponential distribution with a rate of {rate} orders per minute.", "slicing duration"),
        ]),
        ("Public Transit & Commuter Waiting Times", [
            ("Metropolitan Underground Subway Train Arrival", "The waiting time for the next downtown subway train follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Urban Commuter Cross-River Ferry Departure", "The waiting time until the next passenger ferry departure follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Downtown Circulator Streetcar Arrival", "The waiting time for a high-frequency urban streetcar follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Airport Inter-Terminal Automated People Mover", "The waiting time for the next autonomous monorail shuttle follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Ride-Hailing Vehicle Curbside Pickup Arrival", "The waiting time for an assigned on-demand ride vehicle to arrive curbside follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("High-Rise Office Tower Elevator Dispatch Wait", "The waiting time for an elevator cab to arrive at the lobby follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Suburban Feeder Bus Neighborhood Arrival", "The waiting time for a suburban transit bus arrival follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Bicycle-Share Dock Availability Refill Wait", "The waiting time until a replenishment van restocks empty bike racks follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
            ("Intercity High-Speed Rail Track Clearance Wait", "The departure holding delay awaiting track switch clearance follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "holding time"),
            ("Campus Transit Night Shuttle Pickup Wait", "The waiting time for an evening student safety shuttle follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "waiting time"),
        ]),
        ("Network Packet Inter-Arrival Times", [
            ("Core Internet Backbone Router Packet Spacing", "The inter-arrival time between consecutive high-priority IP packets at a core router interface follows an Exponential distribution with a rate of {rate} per millisecond.", "inter-arrival time"),
            ("Industrial IoT Sensor Telemetry Packet Burst", "The time elapsed between wireless MQTT telemetry packet bursts follows an Exponential distribution with a rate of {rate} per second.", "inter-arrival time"),
            ("Database Read Replica Query Spacing", "The interval between incoming read-only SQL queries arriving at a database replica follows an Exponential distribution with a rate of {rate} per millisecond.", "inter-arrival interval"),
            ("Video Streaming Segment Chunk Request Interval", "The time between consecutive HLS video chunk downloads follows an Exponential distribution with a rate of {rate} per second.", "time between chunks"),
            ("Distributed Message Broker Event Arrival", "The time between incoming JSON events published to an Apache Kafka partition follows an Exponential distribution with a rate of {rate} per millisecond.", "inter-arrival time"),
            ("5G Cellular Base Station User Attach Requests", "The time between mobile device cell handover attachment requests follows an Exponential distribution with a rate of {rate} per second.", "time between handovers"),
            ("Domain Name System (DNS) Recursive Resolver Queries", "The time between incoming UDP DNS lookup queries follows an Exponential distribution with a rate of {rate} per millisecond.", "query inter-arrival time"),
            ("Payment Terminal Credit Card Authorization Pings", "The time between incoming POS transaction authorization packets follows an Exponential distribution with a rate of {rate} per second.", "inter-arrival interval"),
            ("Cloud Microservice gRPC RPC Call Invocations", "The inter-arrival duration of RPC invocations follows an Exponential distribution with a rate of {rate} per millisecond.", "invocation spacing"),
            ("Websocket Client Keep-Alive Ping Packets", "The time between incoming client heartbeat pings follows an Exponential distribution with a rate of {rate} per second.", "ping interval"),
        ]),
        ("Nuclear Physics & Radioactive Decay", [
            ("Radon-222 Subterranean Alpha Particle Decay", "The time until radioactive decay of a Radon-222 atomic nucleus follows an Exponential distribution with a rate of {rate} per day.", "decay time"),
            ("Carbon-14 Radioactive Beta Decay Emission", "The lifetime of an individual Carbon-14 radionuclide follows an Exponential distribution with a rate of {rate} per millennium.", "decay lifetime"),
            ("Cobalt-60 Industrial Radiotherapy Gamma Decay", "The time until spontaneous gamma emission from a Cobalt-60 atom follows an Exponential distribution with a rate of {rate} per year.", "decay time"),
            ("Iodine-131 Thyroid Treatment Radioisotope Decay", "The decay time of an Iodine-131 nucleus in medical oncology follows an Exponential distribution with a rate of {rate} per day.", "decay time"),
            ("Americium-241 Ionization Smoke Detector Decay", "The time until an Americium-241 nucleus emits an alpha particle follows an Exponential distribution with a rate of {rate} per decade.", "emission time"),
            ("Technetium-99m Medical Diagnostic Tracer Decay", "The lifetime of a Technetium-99m metastable nuclear isomer follows an Exponential distribution with a rate of {rate} per hour.", "decay lifetime"),
            ("Tritium Radioluminescent Exit Sign Beta Decay", "The time until beta decay of a Tritium atom follows an Exponential distribution with a rate of {rate} per year.", "decay time"),
            ("Uranium-235 Fission Spontaneous Disintegration", "The time until spontaneous fission of a Uranium-235 nucleus follows an Exponential distribution with a rate of {rate} per billion years.", "decay lifetime"),
            ("Polonium-210 Static Eliminator Alpha Decay", "The radioactive lifetime of a Polonium-210 atom in an antistatic strip follows an Exponential distribution with a rate of {rate} per month.", "lifetime"),
            ("Cesium-137 Environmental Soil Tracer Decay", "The time until disintegration of a Cesium-137 nucleus follows an Exponential distribution with a rate of {rate} per year.", "decay time"),
        ]),
        ("Emergency Response & Paramedic Dispatch", [
            ("Advanced Life Support Paramedic Ambulance Response", "The transit response time for an emergency ambulance to reach a cardiac arrest call follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "response time"),
            ("Urban Fire Engine Engine Company Turnout Response", "The time for a fire department pumper truck to arrive at a structure fire follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "response time"),
            ("Police Rapid Response 911 Emergency Dispatch", "The response time for a patrol cruiser to arrive at a priority in-progress burglary follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "response time"),
            ("Mountain Wilderness Search and Rescue Deployment", "The time to mobilize and reach an injured hiker in an alpine national park follows an Exponential distribution with a mean waiting time of {mean_wait} hours.", "response time"),
            ("Marine Coast Guard Air-Sea Rescue Helicopter Launch", "The flight time for a rescue helicopter to reach a distressed vessel follows an Exponential distribution with a mean waiting time of {mean_wait} hours.", "response time"),
            ("Hazardous Materials (HAZMAT) Containment Unit Arrival", "The response time for a chemical containment team to arrive on site follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "response time"),
            ("Power Grid Utility Emergency Wire Repair Dispatch", "The time until an emergency utility crew arrives at a downed live power line follows an Exponential distribution with a mean waiting time of {mean_wait} hours.", "response time"),
            ("Natural Gas Leak Emergency Response Team Arrival", "The arrival response time for gas technicians to isolate a residential gas leak follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "response time"),
            ("Poison Control Mobile Antidote Delivery Transport", "The delivery time for specialized botulism antitoxin to reach a regional hospital follows an Exponential distribution with a mean waiting time of {mean_wait} hours.", "delivery time"),
            ("Hospital Code Blue Crash Cart Nurse Arrival", "The arrival time of a specialized resuscitation team inside a hospital wing follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "arrival time"),
        ]),
        ("Industrial Machine Breakdowns", [
            ("Textile Yarn Spinning Machine Spindle Jams", "The operating time between spindle thread snaps on an automated loom follows an Exponential distribution with a rate of {rate} per hour.", "time between jams"),
            ("Automated Packaging Line Box Erector Jams", "The time elapsed between cardboard carton feeder jams follows an Exponential distribution with a rate of {rate} per shift.", "time between jams"),
            ("Plastic Injection Molding Part Ejection Faults", "The operating duration between robotic part-unloader drop errors follows an Exponential distribution with a rate of {rate} per thousand cycles.", "time between faults"),
            ("High-Speed Can Seamer Jamming Incident Interval", "The running time between seaming roller jams on an automated canning line follows an Exponential distribution with a rate of {rate} per hour.", "running time"),
            ("Sawmill Hydraulic Timber Carriage Stoppages", "The operating time between hydraulic line pressure stalls on a commercial timber saw follows an Exponential distribution with a rate of {rate} per day.", "time between stalls"),
            ("Glass Bottle Annealing Lehr Conveyor Stoppage", "The time between conveyor chain slips in a glass cooling furnace follows an Exponential distribution with a rate of {rate} per week.", "time between slips"),
            ("Metal Stamping Press Feed Sheet Buckling Faults", "The time between coil feeder mis-feeds on a 500-ton stamping press follows an Exponential distribution with a rate of {rate} per hour.", "time between faults"),
            ("Corrugated Paperboard Sheeter Blade Jamming", "The operating time between rotary knife jams in paperboard slitting follows an Exponential distribution with a rate of {rate} per day.", "operating time"),
            ("Semiconductor Wire Bonder Thread Snap Faults", "The machine runtime between micro-wire bond snaps on an IC packaging line follows an Exponential distribution with a rate of {rate} per hour.", "runtime between faults"),
            ("Food Processing Rotary Filling Valve Clogs", "The operating interval between viscous puree nozzle blockages follows an Exponential distribution with a rate of {rate} per shift.", "interval between clogs"),
        ]),
        ("Actuarial Science & Insurance Claim Spacing", [
            ("Catastrophic Commercial Fire Insurance Claims", "The elapsed time between major commercial industrial fire claims at an insurer follows an Exponential distribution with a rate of {rate} per month.", "time between claims"),
            ("Commercial Marine Cargo Ship Loss Claims", "The time between total hull loss claims for an international maritime underwriter follows an Exponential distribution with a rate of {rate} per quarter.", "time between claims"),
            ("Personal Automobile Total-Loss Collision Filings", "The time between comprehensive write-off vehicle accident claims follows an Exponential distribution with a rate of {rate} per day.", "claim spacing"),
            ("Professional Medical Malpractice Claim Incurrences", "The time between major obstetrical malpractice lawsuit filings follows an Exponential distribution with a rate of {rate} per year.", "time between filings"),
            ("Corporate Cybersecurity Ransomware Loss Claims", "The time between cyber insurance extortion payment claims follows an Exponential distribution with a rate of {rate} per month.", "time between claims"),
            ("Agricultural Hail Damage Crop Insurance Claims", "The time between catastrophic summer hailstorm crop loss filings follows an Exponential distribution with a rate of {rate} per week.", "time between filings"),
            ("Residential Basement Flash-Flood Damage Claims", "The time between localized municipal storm flooding claims follows an Exponential distribution with a rate of {rate} per month.", "time between claims"),
            ("Aviation Commercial Hull War-Risk Loss Claims", "The time between aviation geopolitical airframe loss claims follows an Exponential distribution with a rate of {rate} per decade.", "time between claims"),
            ("Product Liability Defective Component Claims", "The time between major mass-tort product liability claim filings follows an Exponential distribution with a rate of {rate} per year.", "time between claims"),
            ("Directors & Officers (D&O) Securities Lawsuit Claims", "The time between shareholder class-action D&O insurance claims follows an Exponential distribution with a rate of {rate} per month.", "time between claims"),
        ]),
        ("Software System Crashes & Uptime", [
            ("Linux Production Kernel Panic Crashes", "The uptime between unexpected operating system kernel panics on a database server follows an Exponential distribution with a rate of {rate} per month.", "uptime"),
            ("Distributed Microservice Out-Of-Memory (OOM) Kills", "The time between memory-leak container terminations in a Java service follows an Exponential distribution with a rate of {rate} per week.", "time between crashes"),
            ("Web Server Apache HTTP Unhandled Segfaults", "The operating time between segmentation fault daemon crashes follows an Exponential distribution with a rate of {rate} per day.", "operating time"),
            ("Mobile iOS App Uncaught Exception Crashes", "The app session time before encountering a fatal uncaught exception follows an Exponential distribution with a rate of {rate} per thousand hours.", "session time"),
            ("Distributed Redis Cache Cluster Node Partitions", "The time between network split-brain isolation events on a cache cluster follows an Exponential distribution with a rate of {rate} per month.", "time between partitions"),
            ("Cloud Storage S3 Bucket 503 SlowDown Throttling", "The time between API throughput throttling events on a high-concurrency client follows an Exponential distribution with a rate of {rate} per hour.", "time between events"),
            ("Database Connection Pool Thread Exhaustion", "The runtime between active thread starvation lockups in a web backend follows an Exponential distribution with a rate of {rate} per week.", "runtime"),
            ("Network Switch Spanning Tree Re-Convergence Loops", "The time between automated routing topology reconvergence freezes follows an Exponential distribution with a rate of {rate} per year.", "time between freezes"),
            ("GPU Machine Learning Training Driver Hangs", "The continuous compute time before an NVIDIA kernel driver timeout hang follows an Exponential distribution with a rate of {rate} per day.", "compute time"),
            ("Continuous Delivery Pipeline Worker Disconnections", "The time between build worker daemon disconnects in a CI cluster follows an Exponential distribution with a rate of {rate} per week.", "time between disconnects"),
        ]),
        ("E-Commerce User Session Durations", [
            ("Online Retail Webpage Dwell Time Before Leaving", "The browsing time spent by a visitor on an e-commerce landing page before navigating away follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "browsing time"),
            ("Streaming Platform Video Browse Before Selection", "The time spent browsing the catalog before selecting a movie follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "browsing duration"),
            ("Digital News Article Reading Session Duration", "The duration a reader spends reading an investigative news article follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "reading time"),
            ("Mobile Casual Gaming Session Length", "The active play duration of a user in a mobile puzzle game follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "play session length"),
            ("Online Banking Mobile App Active Session Length", "The duration an authenticated user spends checking account balances follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "session duration"),
            ("Fitness Workout App GPS Tracking Activity Duration", "The time spent recording a jogging session before pausing follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "activity duration"),
            ("Recipe Cooking Website Step Viewing Duration", "The time spent viewing culinary cooking instructions follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "viewing duration"),
            ("Podcast Listening Session Before Pause", "The duration a commuter listens to an episodic audio podcast follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "listening duration"),
            ("Online Furniture AR Preview Placement Duration", "The time a customer spends testing augmented reality furniture previews follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "testing duration"),
            ("Virtual Learning Portal Video Lecture Viewing", "The continuous duration a student watches a recorded university lecture follows an Exponential distribution with a mean waiting time of {mean_wait} minutes.", "viewing time"),
        ])
    ]

    q_idx = 1
    for cat_name, templates in categories:
        for t_idx, (title, premise, item_noun) in enumerate(templates):
            # Alternate between given rate and given mean waiting time
            rate_vals = [0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.8, 1.0, 1.5, 2.0]
            mean_vals = [2.0, 4.0, 5.0, 8.0, 10.0, 12.0, 15.0, 20.0, 25.0, 30.0]
            
            uses_mean = "mean waiting time" in premise
            if uses_mean:
                mean_wait = mean_vals[(t_idx + q_idx) % len(mean_vals)]
                rate = round(1.0 / mean_wait, 5)
                premise_text = premise.format(mean_wait=mean_wait)
            else:
                rate = rate_vals[(t_idx + q_idx) % len(rate_vals)]
                mean_wait = round(1.0 / rate, 2)
                premise_text = premise.format(rate=rate)
                
            q_mode = t_idx % 6
            if q_mode == 0:
                x = round(mean_wait * 0.7, 2)
                q_text = f"{premise_text} What is the probability of at most {x}?"
                query = {"type": "prob_less_equal", "x": x}
                diff = "Basic"
            elif q_mode == 1:
                x = round(mean_wait * 1.5, 2)
                q_text = f"{premise_text} What is the probability of at least {x}?"
                query = {"type": "prob_greater_equal", "x": x}
                diff = "Basic"
            elif q_mode == 2:
                x = round(mean_wait * 2.0, 2)
                q_text = f"{premise_text} What is the probability of more than {x}?"
                query = {"type": "prob_greater", "x": x}
                diff = "Intermediate"
            elif q_mode == 3:
                x = round(mean_wait * 0.4, 2)
                q_text = f"{premise_text} What is the probability of less than {x}?"
                query = {"type": "prob_less", "x": x}
                diff = "Intermediate"
            elif q_mode == 4:
                a = round(mean_wait * 0.5, 2)
                b = round(mean_wait * 1.8, 2)
                q_text = f"{premise_text} What is the probability of between {a} and {b}?"
                query = {"type": "prob_interval", "a": a, "b": b}
                diff = "Intermediate"
            else:
                q_text = f"{premise_text} Find the median."
                query = {"type": "quantile", "p": 0.5}
                diff = "Advanced"

            questions.append({
                "id": f"exp-{q_idx:03d}",
                "distribution": "exponential",
                "category": cat_name,
                "difficulty": diff,
                "title": title,
                "question": q_text,
                "params": {"rate": rate},
                "query": query
            })
            q_idx += 1
            
    return questions


def create_gamma_questions():
    questions = []
    
    categories = [
        ("Multi-Stage Software & Pipeline Execution", [
            ("Continuous Integration 4-Stage Build Duration", "Total execution time for a 4-stage automated compilation and testing pipeline follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "build duration in minutes"),
            ("Cloud Microservice Multi-Hop Data Ingestion", "Total end-to-end processing time for streaming telemetry packets across sequential message brokers follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "ingestion time in seconds"),
            ("Automated Database Backup Compression and Upload", "The cumulative time to snapshot, encrypt, and replicate a database to cold storage has a Gamma distribution with a shape of {shape} and a rate of {rate}.", "backup time in hours"),
            ("Machine Learning Distributed Model Checkpointing", "The time required to serialize and sync large neural network weight tensors follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "checkpointing duration in minutes"),
            ("Kubernetes Zero-Downtime Rolling Update Time", "The total deployment duration to cycle and health-check all container pods follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "rollout duration in minutes"),
            ("Cryptographic Block Cipher Multi-Round Hashing", "The aggregate computational latency to perform multi-round zero-knowledge proof verification follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "verification time in seconds"),
            ("Big Data ETL Batch MapReduce Aggregation", "The total runtime of a distributed Spark batch transformation follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "runtime in hours"),
            ("Web Application Security Static Code Analysis", "The complete scan time for a million lines of source code follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "analysis time in minutes"),
            ("Full System Disaster Recovery Cold Standby Spin-Up", "The time to spin up and load persistent storage snapshots in an alternate region follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "recovery time in hours"),
            ("Containerized Microservice API Load Testing Run", "The duration of a full automated stress testing benchmark suite follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "test duration in minutes"),
        ]),
        ("Multi-Component Redundancy & Sequential Backup", [
            ("Triple-Redundant Subsea Telemetry Transponder Battery", "The total operating lifetime of 3 sequentially activating subsea lithium battery packs follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "operating lifetime in years"),
            ("Spacecraft Cold Gas Attitude Thruster Valve Cycles", "Cumulative operational life across redundant propulsion solenoid valves follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "lifespan in thousands of hours"),
            ("Emergency Hospital Backup Diesel Generator Run-Time", "The cumulative run-time before overhaul across 4 sequential backup engine generators follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "runtime in hundreds of hours"),
            ("Nuclear Reactor Control Rod Hydraulic Actuator Pack", "The total service lifespan of redundant hydraulic scram control cylinders follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "lifespan in years"),
            ("Aero-Engine Multi-Channel FADEC Electronic Controller", "The combined operational hours of primary and standby engine management channels follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "operating time in flight hours"),
            ("Undersea Optical Submarine Cable Repeater Lasers", "The cumulative lifetime of dual backup pump lasers inside an undersea optical amplifier follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "lifetime in decades"),
            ("Commercial High-Rise Fire Suppression Jockey Pumps", "Total operational life of sequential water booster pumps follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "operational life in years"),
            ("Unmanned Aerial Vehicle (UAV) Redundant Avionics Bus", "The service lifetime of 3 parallel-switched navigation gyroscopes follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "service life in flight hours"),
            ("Automated External Defibrillator (AED) Capacitor Bank", "The total charge-discharge endurance of sequential high-voltage storage capacitors follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "charge cycles"),
            ("Satellite Reaction Wheel Momentum Gyroscope Bearing", "The combined life of sequential momentum reaction wheels on a communication satellite follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "service life in years"),
        ]),
        ("Cumulative Waiting Time in Poisson Queues", [
            ("Time Until Arrival of 5th Call Center Customer", "The cumulative waiting time until the 5th incoming customer call in a Poisson stream follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "waiting time in minutes"),
            ("Waiting Time for 6th Commuter Train Departure", "The elapsed time until the 6th suburban train departs follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "elapsed time in hours"),
            ("Time for 4th Trauma Patient Arrival at Emergency Ward", "The total waiting time until the 4th acute trauma patient arrives follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "waiting time in hours"),
            ("Time to Ingest 10th Heavy Freight Truck at Dock", "The total elapsed duration until 10 long-haul trucks enter the distribution yard follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "time in hours"),
            ("Arrival Time for 8th Aircraft on Final Approach", "The time required for an air traffic controller to sequence 8 arriving airliners follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "sequencing time in minutes"),
            ("Waiting Time for 5th Transaction at ATM Terminal", "The total elapsed time until 5 cardholders complete withdrawals follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "elapsed time in minutes"),
            ("Time Until 7th Micro-Earthquake Aftershock", "The waiting time until the 7th seismic tremor occurs follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "waiting time in days"),
            ("Time for 12th Bus Passenger Boarding Sequence", "The total loading time for 12 passengers boarding via automated smartcards follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "boarding time in minutes"),
            ("Time for 6th Cargo Container Gantry Lift", "The total cycle time to hoist and secure 6 shipping containers follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "time in minutes"),
            ("Time Until 3rd Server Hardware Disk Failure", "The elapsed calendar time until a multi-disk RAID array suffers its 3rd disk failure follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "elapsed time in months"),
        ]),
        ("Aggregate Insurance Claims & Loss Reserves", [
            ("Commercial Fleet Automobile Aggregate Collision Claims", "Annual aggregate claim losses for a commercial truck fleet follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "aggregate loss in million dollars"),
            ("Professional Indemnity Architect Malpractice Losses", "Total annual liability claim settlements for a structural engineering firm follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "settlement total in million dollars"),
            ("Municipal Property Storm Damage Compensation Reserves", "Total seasonal claims paid out for municipal hail roof damage follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "claims total in million dollars"),
            ("Commercial Maritime Freight Cargo Contamination Losses", "Annual compensation paid for spoiled temperature-controlled cargo follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "losses in hundreds of thousands"),
            ("Healthcare Medical Malpractice Surgical Complication Claims", "Total annual settlement costs for an acute surgical hospital follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "annual settlement in million dollars"),
            ("Worker Compensation Repetitive Strain Claim Reserves", "Annual worker indemnity compensation payouts for a manufacturing plant follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "total payout in million dollars"),
            ("Aviation Ground Handling Aircraft Apron Damage Losses", "Annual collision damage repair payouts across international airports follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "losses in million dollars"),
            ("Cyber Ransomware Extortion Reimbursement Portfolio", "Total annual extortion reimbursements paid out to policyholders follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "claims in million dollars"),
            ("Agricultural Drought Crop Loss Insurance Indemnities", "Total annual drought compensation paid to corn farmers in a county follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "indemnity in million dollars"),
            ("Homeowner Wildfire Structural Property Damage Payouts", "Total insured losses incurred by a catastrophic wildfire follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "losses in ten-million dollars"),
        ]),
        ("Hydrology, Precipitation & River Flow", [
            ("Monthly Total Monsoon Catchment Rainfall", "Total monthly precipitation volume collected in a river catchment basin follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "rainfall in centimeters"),
            ("Mountain Watershed Spring Snowmelt Runoff Volume", "The cumulative seasonal water volume discharging from an alpine watershed follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "runoff volume in million cubic meters"),
            ("Reservoir Hydroelectric Inflow Accumulation", "Weekly natural inflow volumes into a hydroelectric reservoir follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "inflow volume in cubic hectometers"),
            ("Arid Valley Flash Flood Torrent Discharge Volume", "Total water volume produced by an episodic desert convective storm follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "discharge volume in thousand m3"),
            ("Agricultural Irrigation Canal Seasonal Diverted Volume", "Seasonal irrigation water diverted into a network of farming aqueducts follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "water volume in megaliters"),
            ("Urban Stormwater Detention Basin Surge Storage", "Total runoff volume entering a municipal flood control retention basin follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "surge volume in megaliters"),
            ("Coastal River Estuary Peak High-Tide Flood Inflow", "Total storm surge volume pushed up a coastal river estuary follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "flood volume in million m3"),
            ("Aquifer Groundwater Recharge Winter Rainfall Infiltration", "Total seasonal rainfall volume recharging a limestone karst aquifer follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "recharge depth in mm"),
            ("Alpine Glacial Meltwater Stream Seasonal Outflow", "Total summer melt discharge issuing from a high-altitude glacier follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "melt outflow in million m3"),
            ("Wetland Peat Bog Water Table Saturation Depth", "Effective accumulated saturation depth of water in a conserved peatland follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "saturation depth in cm"),
        ]),
        ("Pharmacokinetics & Multi-Dose Drug Clearance", [
            ("Intravenous Antibiotic Plasma Clearance Duration", "The total time required for systemic elimination of an intravenous antibiotic follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "elimination time in hours"),
            ("Chemotherapy Drug Multi-Compartment Elimination Half-Life", "The time to clear active cytotoxic metabolites across sequential biological organs follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "clearance time in days"),
            ("Monoclonal Antibody Target-Mediated Drug Disposition", "The time required to deplete circulating therapeutic IgG antibodies follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "disposition time in weeks"),
            ("Oral Extended-Release Analgesic Hepatic Metabolism", "The time required for complete first-pass and systemic clearance of an opioid analgesic follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "metabolism time in hours"),
            ("Inhaled Bronchodilator Pulmonary Absorption Time", "The time for multi-stage aerosolized drug absorption into bronchial smooth muscle follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "absorption time in minutes"),
            ("Subcutaneous Insulin Glargine Depot Dissolution", "The total duration required for insulin micro-precipitates to dissolve into bloodstream follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "dissolution time in hours"),
            ("Anesthetic Volatile Gas Pulmonary Alveolar Washout", "The time for full pulmonary exhalation washout of halogenated general anesthesia follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "washout time in minutes"),
            ("Oral Anticoagulant Hepatic Cytochrome P450 Clearance", "The duration required to metabolize a therapeutic dose of warfarin follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "clearance time in days"),
            ("Liposomal Antifungal Drug Tissue Sequestration Release", "The release time of amphotericin B from reticuloendothelial storage follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "release time in weeks"),
            ("Topical Transdermal Patch Reservoir Drug Delivery", "The duration of continuous active hormone delivery through stratum corneum follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "delivery time in days"),
        ]),
        ("Material Fatigue & Micro-Stress Cycles", [
            ("Aviation Fuselage Aluminum Micro-Crack Formation", "The cumulative stress cycles before fatigue micro-crack initiation in aircraft skin follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "cycles in thousands"),
            ("Railway High-Speed Axle Bearing Cyclic Stress Life", "Cumulative rotational fatigue cycles until bearing race spalling follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "cycles in millions"),
            ("Suspension Bridge Hanger Cable Tensile Fatigue Cycles", "The wind-induced cyclic vibration cycles before strand fretting fatigue follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "vibration cycles in millions"),
            ("Automotive Engine Valve Spring Compression Fatigue", "Total harmonic compression cycles before spring wire micro-fissuring follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "cycles in millions"),
            ("Offshore Wind Turbine Tower Welded Flange Fatigue", "Wave-induced cyclic bending cycles before weld toe fatigue crack propagation follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "cycles in millions"),
            ("Prosthetic Titanium Hip Joint Walking Stress Cycles", "Cumulative gait load cycles before fatigue delamination of an artificial hip follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "gait cycles in millions"),
            ("High-Pressure Gas Storage Cylinder Cyclic Pressurization", "The number of refill pressure expansion cycles before composite cylinder liner yield follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "refill cycles in thousands"),
            ("Marine Propeller Bronze Blade Cavitation Pitting Cycles", "Cumulative propeller rotation cycles before cavitation erosion pitting occurs follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "rotations in millions"),
            ("Earthquake Structural Damper Hysteretic Energy Cycles", "The cyclic seismic energy dissipation cycles sustained by a fluid viscous damper follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "cycles"),
            ("Micro-Electro-Mechanical (MEMS) Cantilever Oscillation", "Cumulative gigahertz resonance cycles before silicon beam micro-fatigue fracture follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "cycles in billions"),
        ]),
        ("Cloud Computing Batch Job Processing", [
            ("Genomic DNA Next-Generation Sequence Alignment", "The total processing compute time to align high-throughput sequencing reads follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "compute time in hours"),
            ("CGI Feature Film Photorealistic Frame Rendering", "The cluster compute time to ray-trace a complex 3D animation scene follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "render time in hours"),
            ("Financial Monte Carlo Value-at-Risk Simulation", "The execution time of a 10-million-path portfolio risk simulation follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "runtime in minutes"),
            ("Climate Model Atmospheric Global Circulation Forecast", "The supercomputer runtime required to project a 10-day global weather forecast follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "runtime in hours"),
            ("Cryptographic Large-Prime Factorization Job", "The cumulative compute core hours required to factor an RSA modulus follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "core hours in hundreds"),
            ("Large Language Model Gradient Checkpoint Sharding", "The synchronization latency across distributed GPU clusters during backward pass follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "latency in seconds"),
            ("Photogrammetry Drone Aerial 3D Mesh Reconstruction", "The processing time to stitch and triangulate thousands of drone aerial orthophotos follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "processing time in hours"),
            ("Seismic Reflection Subsurface Geological Processing", "The compute cluster time to migrate 3D seismic acoustic survey data follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "runtime in days"),
            ("Aerodynamic Computational Fluid Dynamics (CFD) Wing Mesh", "The time to converge a Reynolds-averaged Navier-Stokes aircraft wing simulation follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "time in hours"),
            ("Video Transcoding Multi-Bitrate H.265 Encoding", "The total time to transcode an ultra-high-definition feature film into adaptive bitrates follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "encoding time in minutes"),
        ]),
        ("Civil Infrastructure Load Accumulation", [
            ("Highway Overpass Heavy Freight Vehicle Axle Loading", "The accumulated traffic load weight passing over a highway overpass bridge follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "traffic load in thousand tons"),
            ("Commercial Airport Runway Pavement ESAL Accumulation", "The equivalent single axle load (ESAL) cycles sustained by an international runway follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "ESAL in millions"),
            ("Hydroelectric Concrete Arch Dam Hydrostatic Water Head", "The accumulated seasonal hydrostatic water load pushing against a concrete gravity dam follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "hydrostatic load in giga-newtons"),
            ("Railway Ballast Track Settlement Under Tonnage", "The track vertical settlement displacement under heavy mineral freight trains follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "settlement in millimeters"),
            ("Subway Underground Tunnel Rock Pressure Convergence", "Cumulative overburden rock pressure measured on concrete tunnel segments follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "pressure in megapascals"),
            ("Harbor Quay Wall Mooring Bollard Wave Forces", "Accumulated wave surge pull forces on large container vessel mooring bollards follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "force in mega-newtons"),
            ("Skyscraper Foundation Piling Soil Skin Friction Load", "Cumulative axial compression load transferred to deep bedrock drilled shafts follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "load in meganewtons"),
            ("Coastal Sea Wall Wave Overtopping Kinetic Energy", "Accumulated storm surge wave impact energy striking a vertical sea wall follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "energy in gigajoules"),
            ("Geothermal Energy Borehole Casing Thermal Stresses", "Cumulative thermo-mechanical expansion stresses in deep geothermal wells follow a Gamma distribution with a shape of {shape} and a rate of {rate}.", "stress in megapascals"),
            ("Highway Retaining Wall Granular Soil Lateral Thrust", "Accumulated earth pressure lateral thrust pushing against a reinforced concrete retaining wall follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "thrust in kilonewtons/meter"),
        ]),
        ("Biomedical Tissue Growth & Healing Times", [
            ("Orthopedic Bone Fracture Callus Remodeling Duration", "The total physiological time for stable bony callus bridging in a fractured tibia follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "healing time in weeks"),
            ("Surgical Incision Dermal Tensile Strength Recovery", "The time required for an abdominal surgical wound to regain 80% tensile strength follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "recovery time in days"),
            ("Corneal Epithelial Cell Migration Re-Surfacing", "The time for complete epithelial closure following photorefractive keratectomy eye surgery follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "closure time in days"),
            ("Autologous Skin Graft Vascularization Integration", "The biological time required for capillary inosculation of a split-thickness skin graft follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "integration time in days"),
            ("Peripheral Nerve Axon Sprouting Re-Innervation", "The time required for regenerating motor nerve axons to reach target muscle motor units follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "re-innervation time in months"),
            ("Dental Implant Osseointegration Bone Ingrowth", "The time required for rigid mineralized bone anchoring of a titanium dental implant follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "osseointegration in weeks"),
            ("Tendon Graft Remodeling in ACL Knee Reconstruction", "The biological ligamentization duration of a patellar tendon graft follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "remodeling time in months"),
            ("Cardiac Muscle Fibrotic Scar Maturation Post-Infarct", "The physiological time for collagen cross-linking and scar stabilization following myocardial infarction follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "maturation time in weeks"),
            ("Skin Burn Granulation Tissue Formation Time", "The time required for healthy vascularized granulation bed formation in deep partial-thickness burns follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "formation time in days"),
            ("Cartilage Chondrocyte Matrix Deposition in Bio-Scaffolds", "The maturation time for laboratory-engineered cartilage implants to deposit collagen-II follows a Gamma distribution with a shape of {shape} and a rate of {rate}.", "maturation time in weeks"),
        ])
    ]

    q_idx = 1
    for cat_name, templates in categories:
        for t_idx, (title, premise, item_noun) in enumerate(templates):
            shape_vals = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0]
            rate_vals = [0.25, 0.4, 0.5, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 4.0]
            
            shape = shape_vals[(t_idx + q_idx) % len(shape_vals)]
            rate = rate_vals[(t_idx + q_idx) % len(rate_vals)]
            
            mean_val = round(shape / rate, 2)
            premise_text = premise.format(shape=shape, rate=rate)
            
            q_mode = t_idx % 6
            if q_mode == 0:
                x = round(mean_val * 0.7, 2)
                q_text = f"{premise_text} What is the probability of at most {x}?"
                query = {"type": "prob_less_equal", "x": x}
                diff = "Basic"
            elif q_mode == 1:
                x = round(mean_val * 1.4, 2)
                q_text = f"{premise_text} What is the probability of at least {x}?"
                query = {"type": "prob_greater_equal", "x": x}
                diff = "Basic"
            elif q_mode == 2:
                x = round(mean_val * 1.8, 2)
                q_text = f"{premise_text} What is the probability of more than {x}?"
                query = {"type": "prob_greater", "x": x}
                diff = "Intermediate"
            elif q_mode == 3:
                x = round(mean_val * 0.4, 2)
                q_text = f"{premise_text} What is the probability of less than {x}?"
                query = {"type": "prob_less", "x": x}
                diff = "Intermediate"
            elif q_mode == 4:
                a = round(mean_val * 0.6, 2)
                b = round(mean_val * 1.5, 2)
                q_text = f"{premise_text} What is the probability of between {a} and {b}?"
                query = {"type": "prob_interval", "a": a, "b": b}
                diff = "Intermediate"
            else:
                q_text = f"{premise_text} Find the median."
                query = {"type": "quantile", "p": 0.5}
                diff = "Advanced"

            questions.append({
                "id": f"gam-{q_idx:03d}",
                "distribution": "gamma",
                "category": cat_name,
                "difficulty": diff,
                "title": title,
                "question": q_text,
                "params": {"shape": shape, "rate": rate},
                "query": query
            })
            q_idx += 1
            
    return questions


def create_weibull_questions():
    questions = []
    
    categories = [
        ("Wind Energy & Turbine Assessment", [
            ("Offshore Wind Turbine Hub-Height Velocity", "Wind velocity measured at an offshore turbine hub follows a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind speed in m/s"),
            ("Coastal Wind Farm Hourly Sustained Gusts", "Hourly sustained wind gusts across a coastal ridgeline wind park follow a Weibull distribution with a shape of {shape} and a scale of {scale} km/h.", "wind gust in km/h"),
            ("Mountain Pass Wind Tunnel Energy Potential", "Aerodynamic wind speeds through a narrow mountain gorge follow a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind velocity in m/s"),
            ("High-Altitude Wind Airborne Kite Turbines", "Wind speeds measured by tropospheric airborne tethered energy generators follow a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind speed in m/s"),
            ("Desert Wind Farm Cut-In Wind Threshold", "Ambient wind velocities at a commercial desert solar-wind hybrid park follow a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind velocity"),
            ("Arctic Tundra High-Density Wind Corridor", "Extreme cold-climate wind velocities over flat tundra terrain follow a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind speed"),
            ("Urban Rooftop Micro-Wind Turbine Aerodynamics", "Turbulent wind speeds above downtown high-rise building canopies follow a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind speed"),
            ("Island Microgrid Marine Wind Velocity Profile", "Local boundary-layer wind velocity blowing onto an isolated island grid follows a Weibull distribution with a shape of {shape} and a scale of {scale} knots.", "wind speed in knots"),
            ("Forested Plateau Canopy Wind Shear Profile", "Wind velocity measured at 80 meters above a dense pine canopy follows a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind velocity"),
            ("Deep-Water Floating Wind Platform Aerodynamics", "Sea surface wind speeds acting upon a spar-buoy floating turbine follow a Weibull distribution with a shape of {shape} and a scale of {scale} m/s.", "wind speed"),
        ]),
        ("Composite Materials & Tensile Breaking Strength", [
            ("Carbon-Fiber Epoxy Composite Tensile Strength", "The ultimate tensile breaking strength of high-modulus carbon-fiber coupons follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "breaking strength in MPa"),
            ("Structural Architectural Tempered Glass Modulus", "The surface fracture strength of architectural tempered glass facade panels follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "fracture stress in MPa"),
            ("Advanced Silicon Nitride Ceramic Ball Bearing Strength", "The crushing fracture load of hot-isostatically pressed ceramic bearing spheres follows a Weibull distribution with a shape of {shape} and a scale of {scale} kN.", "crushing load in kN"),
            ("Kevlar Aramid Ballistic Fiber Tensile Limit", "The breaking force of high-tenacity aramid yarn used in body armor follows a Weibull distribution with a shape of {shape} and a scale of {scale} N.", "breaking force in N"),
            ("Optical Glass Telecommunication Fiber Breaking Strain", "The tensile failure strain percentage of silica optical communication fibers follows a Weibull distribution with a shape of {shape} and a scale of {scale} percent.", "failure strain %"),
            ("Dental Zirconia Ceramic Crown Bending Strength", "The biaxial flexural strength of CAD/CAM milled monolithic dental zirconia follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "flexural strength in MPa"),
            ("Aerospace Titanium Matrix Composite Fiber Pullout", "The interfacial shear bond strength between titanium alloy and silicon carbide fibers follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "bond strength in MPa"),
            ("High-Performance Concrete Flexural Toughness", "The flexural tensile strength of steel-fiber-reinforced ultra-high-performance concrete follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "tensile strength in MPa"),
            ("Photovoltaic Solar Cell Silicon Wafer Bending Fracture", "The mechanical bending fracture resistance of thin crystalline silicon solar wafers follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "fracture stress in MPa"),
            ("Graphene-Enhanced Epoxy Adhesive Lap-Shear Strength", "The lap-shear adhesive bonding strength of aerospace nanocomposite adhesives follows a Weibull distribution with a shape of {shape} and a scale of {scale} MPa.", "shear strength in MPa"),
        ]),
        ("Mechanical Ball Bearings & Wear-Out Failures", [
            ("Heavy Industrial Conveyor Roller Ball Bearing Life", "The fatigue operating life of deep-groove roller ball bearings follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "bearing lifetime"),
            ("Automotive Wheel Hub Tapered Roller Bearing Fatigue", "Operating mileage until fatigue spalling on automotive front wheel bearings follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand miles.", "operating mileage"),
            ("High-Speed CNC Machine Tool Spindle Bearing Life", "The running lifespan of hybrid ceramic spindle bearings operating at 24,000 RPM follows a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "spindle life in hours"),
            ("Wind Turbine Main Shaft Spherical Roller Bearing Life", "The operating lifetime before sub-surface micro-cracking in main wind turbine bearings follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "lifespan in years"),
            ("Electric Locomotive Traction Motor Armature Bearings", "The operational hours before fluting electrical discharge damage on rail motor bearings follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "operating hours"),
            ("Mining Slurry Pump Severe-Service Bearing Longevity", "The operating time before abrasive slurry contamination bearing failure follows a Weibull distribution with a shape of {shape} and a scale of {scale} days.", "operating days"),
            ("Aircraft Landing Gear Wheel Needle Roller Bearings", "The operational flight landings before bearing raceway brinelling follows a Weibull distribution with a shape of {shape} and a scale of {scale} landings.", "landings until failure"),
            ("Commercial Marine Propeller Thrust Bearing Longevity", "The running lifetime of heavy tilting-pad thrust bearings on cargo ships follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand operating hours.", "running hours"),
            ("Industrial Centrifugal Gas Compressor Tilting-Pad Life", "The service life of hydrodynamic journal bearings in natural gas pipeline compressors follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "service life in years"),
            ("Automated Robotic Joint Planetary Gearbox Bearing Life", "The cycloidal gearbox bearing operational life in high-speed welding robots follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand cycles.", "operational cycles"),
        ]),
        ("Aviation Turbines & Jet Engine Stress", [
            ("Turbine High-Pressure Blade Thermal Barrier Coating", "The operational hours before spallation of ceramic thermal barrier coatings on turbine blades follow a Weibull distribution with a shape of {shape} and a scale of {scale} flight hours.", "coating life in hours"),
            ("Turbofan Jet Engine Compressor Disk Low-Cycle Fatigue", "The cyclic life before fatigue crack initiation in titanium compressor disks follows a Weibull distribution with a shape of {shape} and a scale of {scale} flight cycles.", "flight cycles"),
            ("Aircraft Combustion Chamber Liner Burnout Longevity", "The operating time until hot-spot burn-through of nickel-superalloy combustor liners follows a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "operating hours"),
            ("Turbine Stator Vane Thermal Creep Deflection", "The service time before thermal creep deflection exceeds clearance tolerances follows a Weibull distribution with a shape of {shape} and a scale of {scale} flight hours.", "service hours"),
            ("Aviation Jet Fuel Atomizer Nozzle Coking Degradation", "The operating time before carbon coking obstructs fuel spray uniformity follows a Weibull distribution with a shape of {shape} and a scale of {scale} hundred hours.", "operating hours"),
            ("Helicopter Turboshaft Power Turbine Shaft Fatigue", "The torque fatigue life of a helicopter drive turbine shaft follows a Weibull distribution with a shape of {shape} and a scale of {scale} flight hours.", "shaft life in hours"),
            ("Afterburner Flameholder Structural Fatigue Life", "The thermal-acoustic fatigue life of supersonic afterburner flameholders follows a Weibull distribution with a shape of {shape} and a scale of {scale} supersonic hours.", "operating hours"),
            ("Turbine Shroud Segment Honeycomb Seal Rub Wear", "The running hours before abradable seal wear increases tip leakage follows a Weibull distribution with a shape of {shape} and a scale of {scale} flight hours.", "running hours"),
            ("Commercial Airliner Thrust Reverser Actuator Longevity", "The deployment cycles before hydraulic actuator seal leakage follows a Weibull distribution with a shape of {shape} and a scale of {scale} cycles.", "reverser cycles"),
            ("Jet Engine Variable Inlet Guide Vane Bushing Wear", "The operational flight hours before wear in composite vane pivot bushings exceeds limits follow a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "operating hours"),
        ]),
        ("Automotive Powertrains & Fuel Systems", [
            ("Electric Vehicle Battery Pack Water Pump Life", "The operational lifespan of an EV thermal management coolant pump follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand km.", "pump life in thousand km"),
            ("Gasoline Direct Injection High-Pressure Fuel Injector", "The operating mileage until nozzle needle valve seating wear follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand miles.", "operating mileage"),
            ("Automotive Dual-Mass Flywheel Torsional Spring Fatigue", "The operating distance before internal damping spring fracture in a dual-mass flywheel follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand km.", "distance in thousand km"),
            ("Heavy-Duty Diesel Turbocharger Journal Bearing Longevity", "Operating hours before oil seal leakage in a long-haul commercial truck turbocharger follow a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "operating hours"),
            ("Continuously Variable Transmission (CVT) Steel Belt Life", "The mileage before tensile band fatigue failure in a steel CVT push-belt follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand miles.", "mileage until failure"),
            ("Automotive Alternator Decoupler Pulley Lifespan", "Operating mileage until one-way sprag clutch seizure in an alternator pulley follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand km.", "operating mileage"),
            ("Electronic Throttle Body Actuator Motor Gear Wear", "The actuation cycles before plastic gear teeth strip in an electronic throttle follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand cycles.", "actuation cycles"),
            ("Automobile Hydraulic Power Steering Rack Seal Life", "The operating mileage before pressurized fluid leakage in a steering rack follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand miles.", "mileage in thousand miles"),
            ("Brake Caliper EPDM Rubber Piston Dust Boot Life", "The service life of rubber dust boots protecting brake caliper pistons follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "service life in years"),
            ("Automotive Air Conditioning Rotary Vane Compressor", "Operating hours before internal reed valve fatigue in an automotive A/C compressor follow a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "operating hours"),
        ]),
        ("Pipeline Corrosion & Wall Thinning", [
            ("Crude Oil Transmission Pipeline Pitting Corrosion", "The operational time until internal micro-pitting penetrates 50% of steel pipeline wall thickness follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "time until penetration"),
            ("Municipal Subterranean Cast Iron Water Main Rupture", "The operating lifespan before external graphitic corrosion ruptures a municipal water pipe follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "lifespan in years"),
            ("Offshore Subsea Natural Gas Pipeline Hydrogen Induced Cracking", "The time until hydrogen-induced micro-crack coalescence in an offshore sour gas pipeline follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "time in years"),
            ("District Heating High-Pressure Steam Pipe Wall Thinning", "The service duration before flow-accelerated corrosion reduces steam pipe wall thickness follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "service duration in years"),
            ("Geothermal Brine Extraction Pipe Mineral Scaling & Erosion", "Operating months before abrasive mineral scale compromises geothermal extraction pipes follow a Weibull distribution with a shape of {shape} and a scale of {scale} months.", "operating months"),
            ("Chemical Plant Stainless Steel Acid Line Crevice Corrosion", "The operating time before chloride crevice corrosion breaches a 316L stainless pipe follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "operating time in years"),
            ("Refinery Hydrocracker Effluent Air Cooler Tube Erosion", "The service time before ammonium bisulfide corrosion perforates heat exchanger tubes follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "service time in years"),
            ("Nuclear Power Secondary Feedwater Pipe Cavitation Erosion", "The operating hours before cavitation erosion penetrates carbon steel elbows follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "operating hours"),
            ("Subsea Petroleum Wellhead Christmas Tree Valve Erosion", "The time before abrasive sand particle impingement wears out subsea choke valves follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "time until wear-out"),
            ("Sewage Force Main Hydrogen Sulfide Crown Corrosion", "The time until sulfuric acid microbial corrosion collapses an unlined concrete sewer pipe follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "time until collapse"),
        ]),
        ("Biomedical Prosthetics & Implant Durability", [
            ("Total Hip Arthroplasty Ultra-High Molecular Weight Polyethylene Cup", "The operational in-vivo lifespan before wear thinning of a UHMWPE hip acetabular cup exceeds 2 mm follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "in-vivo lifespan in years"),
            ("Mechanical Bileaflet Pyrolytic Carbon Heart Valve Life", "The structural fatigue cycles sustained by a pyrolytic carbon heart valve leaflet follow a Weibull distribution with a shape of {shape} and a scale of {scale} million beats.", "cardiac cycles in millions"),
            ("Implantable Cardiac Pacemaker Lithium-Iodine Battery", "The operational service longevity before battery elective replacement indicator (ERI) activation follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "battery longevity in years"),
            ("Silicone Gel Breast Implant Outer Shell Rupture", "The implantation time before mechanical fold-flaw rupture of an elastomer breast implant follows a Weibull distribution with a shape of {scale} years with shape {shape}.", "time until rupture in years"),
            ("Dental Titanium Root Implant Mandibular Bone Osseous Fatigue", "The chewing mastication cycles sustained before fatigue fracture of a dental implant abutment screw follow a Weibull distribution with a shape of {shape} and a scale of {scale} million cycles.", "mastication cycles in millions"),
            ("Total Knee Replacement Cobalt-Chrome Femoral Component", "The in-vivo wear life of a cobalt-chromium femoral knee component follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "wear life in years"),
            ("Cochlear Implant Hermetic Titanium Housing Seal", "The operational years before moisture ingress penetrates an inner cochlear receiver hermetic feedthrough follow a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "seal life in years"),
            ("Intraocular Lens (IOL) Posterior Capsule Opacification", "The time following cataract surgery until visual opacification requires YAG laser capsulotomy follows a Weibull distribution with a shape of {shape} and a scale of {scale} months.", "time until opacification"),
            ("Spine Lumbar Disc Prosthesis Elastomeric Core Life", "The cyclic spinal compression cycles before polyurethane artificial disc core tearing follow a Weibull distribution with a shape of {shape} and a scale of {scale} million cycles.", "compression cycles in millions"),
            ("Implantable Deep Brain Stimulator (DBS) Subclavian Lead Wire", "The time before mechanical flexural fatigue fractures a subcutaneously routed DBS lead follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "lead wire life in years"),
        ]),
        ("Cable & Suspension Bridge Fatigue", [
            ("Suspension Bridge Parallel Wire Main Cable Tensile Fatigue", "The service life before fatigue crack propagation in suspension bridge galvanized steel strands follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "cable fatigue life in years"),
            ("Cable-Stayed Bridge Diagonal Stay Cable Anchor Fatigue", "The cyclic traffic loading cycles before stay cable anchor wedge fatigue failure follow a Weibull distribution with a shape of {shape} and a scale of {scale} million cycles.", "traffic cycles in millions"),
            ("Aerial Passenger Cableway Haul Rope Wire Fractures", "The operational rope-pull hours before broken outer wires exceed retirement standards follow a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "rope hours"),
            ("Undersea High-Voltage Direct Current (HVDC) Armored Cable", "The operational lifespan before mechanical bending fatigue breaches submarine cable lead sheathing follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "lifespan in years"),
            ("Offshore Mooring Chain Heavy Steel Link Corrosion Fatigue", "The oceanic deployment time before corrosion fatigue breaches floating oil platform mooring chains follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "time in years"),
            ("Mining Hoist Vertical Shaft Wire Rope Dynamic Fatigue", "The hoisting duty cycles before multi-layer steel rope fatigue discard criteria are reached follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hoists.", "duty cycles in thousands"),
            ("Container Harbor Crane Boom Wire Rope Flexural Life", "The reverse-bending drum cycles before crane hoist rope failure follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand cycles.", "drum cycles in thousands"),
            ("Tower Crane Luffing Jib Guy Wire Tension Fatigue", "The operating hours of a construction crane guy strand before strand wire fretting fatigue follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "operating hours"),
            ("Subsea Autonomous ROV Tether Umbilical Cable Life", "The flexural fatigue cycles of an electro-optical deep-sea umbilical tether follow a Weibull distribution with a shape of {shape} and a scale of {scale} dive cycles.", "dive cycles"),
            ("Structural Fabric Tension Roof Stainless Cable Clamp Life", "The service duration before stainless steel swaged cable terminals experience stress corrosion follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "service duration in years"),
        ]),
        ("Industrial Cutting Tool Life", [
            ("Tungsten Carbide CNC End Mill Flank Wear Longevity", "The cutting machining time before flank wear reaches 0.3 mm on a solid carbide end mill follows a Weibull distribution with a shape of {shape} and a scale of {scale} minutes.", "tool life in minutes"),
            ("Polycrystalline Diamond (PCD) Aluminum Milling Tool Life", "The continuous milling duration before diamond insert edge chipping occurs follows a Weibull distribution with a shape of {shape} and a scale of {scale} hours.", "milling time in hours"),
            ("Cubic Boron Nitride (CBN) Hardened Steel Turning Insert", "The active cutting time before crater wear breaks a CBN turning insert follows a Weibull distribution with a shape of {shape} and a scale of {scale} minutes.", "turning time in minutes"),
            ("High-Speed Steel (HSS) Cobalt Twist Drill Bit Lifetime", "The number of deep holes drilled in structural steel before drill bit chisel edge dulling follows a Weibull distribution with a shape of {shape} and a scale of {scale} holes.", "holes drilled"),
            ("Ceramic Insert Superalloy Inconel Machining Longevity", "The machining duration before notch wear destroys a silicon carbide whisker-reinforced insert follows a Weibull distribution with a shape of {shape} and a scale of {scale} minutes.", "machining duration in minutes"),
            ("Diamond-Coated Router Bit Carbon-Fiber Trimming Life", "The linear meters of aerospace carbon composite trimmed before delamination dulling follows a Weibull distribution with a shape of {shape} and a scale of {scale} meters.", "trimmed meters"),
            ("Rotary Ultrasonic Glass Drilling Trepanning Tool Life", "The number of precision micro-holes drilled in sapphire glass before diamond grit loss follows a Weibull distribution with a shape of {shape} and a scale of {scale} holes.", "drilled holes"),
            ("Industrial Bandsaw Bi-Metal Blade Tooth Stripping Life", "The square meters of solid titanium bar stock cut before tooth strip-out occurs follow a Weibull distribution with a shape of {shape} and a scale of {scale} m2.", "cut area in m2"),
            ("Precision Micro-Drill Printed Circuit Board Drilling Life", "The number of micro-vias drilled in multilayer FR-4 copper laminates before drill breakage follows a Weibull distribution with a shape of {shape} and a scale of {scale} holes.", "drilled micro-vias"),
            ("Woodworking Tungsten Planer Knife Edge Sharpness Life", "The linear kilometers of hardwood lumber planed before knife regrinding is required follow a Weibull distribution with a shape of {shape} and a scale of {scale} km.", "planed km"),
        ]),
        ("Solar Photovoltaic Inverter Reliability", [
            ("Utility-Scale Central Solar Inverter IGBT Power Module", "The operational running hours before thermal fatigue delamination of an IGBT solder joint follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "running hours"),
            ("Residential Micro-Inverter Rooftop Thermal Cycle Longevity", "The rooftop operating lifetime of a 300W micro-inverter subjected to daily solar thermal cycling follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "operating lifetime in years"),
            ("Commercial Solar String Inverter DC Disconnect Switch", "The number of high-voltage DC load-break operations before contact erosion failure follows a Weibull distribution with a shape of {shape} and a scale of {scale} cycles.", "switching cycles"),
            ("Photovoltaic Inverter Internal Cooling Fan Brushless Motor", "The operating hours before bearing grease dry-out in an inverter cooling fan follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "fan operating hours"),
            ("Solar Inverter Metalized Film DC-Link Capacitor Longevity", "The operating lifespan before dielectric breakdown of polypropylene DC-link capacitors follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "capacitor life in years"),
            ("Solar String Inverter Maximum Power Point (MPPT) Relay", "The switching operations before mechanical relay contact welding occurs follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand cycles.", "relay cycles"),
            ("Solar Combiner Box Arc-Fault Detection Interrupter (AFCI)", "The operational hours before false-positive trip component failure in an AFCI module follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand hours.", "operating hours"),
            ("Bifacial Solar Module Encapsulant EVA Delamination Life", "The outdoor UV exposure duration before ethylene vinyl acetate browning and delamination follows a Weibull distribution with a shape of {shape} and a scale of {scale} years.", "exposure time in years"),
            ("Solar Tracker Slew Drive Worm Gearbox Backlash Life", "The mechanical tracking rotation cycles before gearbox backlash exceeds tracking limits follow a Weibull distribution with a shape of {shape} and a scale of {scale} thousand cycles.", "tracking cycles"),
            ("Utility Solar Grid-Tied Inverter AC Isolation Contactor", "The contactor closure duty cycles before electrical contact erosion failure follows a Weibull distribution with a shape of {shape} and a scale of {scale} thousand cycles.", "closure cycles"),
        ])
    ]

    q_idx = 1
    for cat_name, templates in categories:
        for t_idx, (title, premise, item_noun) in enumerate(templates):
            shape_vals = [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.5]
            scale_vals = [50.0, 75.0, 100.0, 120.0, 150.0, 200.0, 250.0, 300.0, 400.0, 500.0]
            
            shape = shape_vals[(t_idx + q_idx) % len(shape_vals)]
            scale = scale_vals[(t_idx + q_idx) % len(scale_vals)]
            
            premise_text = premise.format(shape=shape, scale=scale)
            
            q_mode = t_idx % 6
            if q_mode == 0:
                x = round(scale * 0.7, 1)
                q_text = f"{premise_text} What is the probability of at most {x}?"
                query = {"type": "prob_less_equal", "x": x}
                diff = "Basic"
            elif q_mode == 1:
                x = round(scale * 1.3, 1)
                q_text = f"{premise_text} What is the probability of at least {x}?"
                query = {"type": "prob_greater_equal", "x": x}
                diff = "Basic"
            elif q_mode == 2:
                x = round(scale * 1.6, 1)
                q_text = f"{premise_text} What is the probability of more than {x}?"
                query = {"type": "prob_greater", "x": x}
                diff = "Intermediate"
            elif q_mode == 3:
                x = round(scale * 0.4, 1)
                q_text = f"{premise_text} What is the probability of less than {x}?"
                query = {"type": "prob_less", "x": x}
                diff = "Intermediate"
            elif q_mode == 4:
                a = round(scale * 0.5, 1)
                b = round(scale * 1.4, 1)
                q_text = f"{premise_text} What is the probability of between {a} and {b}?"
                query = {"type": "prob_interval", "a": a, "b": b}
                diff = "Intermediate"
            else:
                q_text = f"{premise_text} Find the cutoff for top 10% longest lasting {item_noun}."
                query = {"type": "find_x_for_p", "p": 0.10, "direction": "greater"}
                diff = "Advanced"

            questions.append({
                "id": f"wei-{q_idx:03d}",
                "distribution": "weibull",
                "category": cat_name,
                "difficulty": diff,
                "title": title,
                "question": q_text,
                "params": {"shape": shape, "scale": scale},
                "query": query
            })
            q_idx += 1
            
    return questions


def main():
    print("Generating comprehensive question bank (100 questions per distribution)...")
    
    binom = create_binomial_questions()
    pois = create_poisson_questions()
    norm = create_normal_questions()
    exp = create_exponential_questions()
    gam = create_gamma_questions()
    wei = create_weibull_questions()
    
    print(f"Generated {len(binom)} Binomial questions")
    print(f"Generated {len(pois)} Poisson questions")
    print(f"Generated {len(norm)} Normal questions")
    print(f"Generated {len(exp)} Exponential questions")
    print(f"Generated {len(gam)} Gamma questions")
    print(f"Generated {len(wei)} Weibull questions")
    
    all_questions = binom + pois + norm + exp + gam + wei
    total = len(all_questions)
    print(f"Total questions generated: {total}")
    assert len(binom) == 100, f"Binomial count is {len(binom)}"
    assert len(pois) == 100, f"Poisson count is {len(pois)}"
    assert len(norm) == 100, f"Normal count is {len(norm)}"
    assert len(exp) == 100, f"Exponential count is {len(exp)}"
    assert len(gam) == 100, f"Gamma count is {len(gam)}"
    assert len(wei) == 100, f"Weibull count is {len(wei)}"
    
    os.makedirs("src/data", exist_ok=True)
    out_file = "src/data/question_bank.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2)
        
    print(f"Successfully saved {total} questions to {out_file} ({os.path.getsize(out_file)} bytes)")

if __name__ == "__main__":
    main()
