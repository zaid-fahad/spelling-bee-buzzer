# 4-Player Buzzer System

A simple Arduino-based 4-player buzzer system with a live web interface to manage rounds, display buzzer queue, and declare winners.

---

## Features

* 4 physical buttons for players.
* Buzzer/LED feedback on button press.
* Live **web display** showing:

  * Player queue with timestamps
  * Current round number
  * Winner of each round
  * Round-wise winners table
* **Admin page** with buttons:

  * Reset queue
  * Next player
  * Declare winner
  * Start new round
  * Reset all rounds
* Automatic queue management (avoids duplicates).

---

## Hardware

* **Arduino Uno**
* **4 push buttons** (players)
* **Buzzer / LED**
* Jumper wires and breadboard

---

## Installation

1. **Upload Arduino sketch** (`buzzer.ino`) to your Arduino Uno.
2. **Install Node.js dependencies**:

```bash
npm install express ws serialport
```

3. **Start server**:

```bash
node server.js
```

4. Open in browser:

   * **Display page:** `http://localhost:9393/display.html`
   * **Admin page:** `http://localhost:9393/admin.html`

---

## Usage

* Players press buttons; the queue is updated in real-time.
* Admin can manage rounds and declare winners.
* Round-wise winners and timestamps are displayed on the display page.

---

## Notes

* Make sure your user has permission to access the serial port (`/dev/ttyACM0` on Linux).
* Buzzer duration can be adjusted in the Arduino code (`delay` after `digitalWrite(BUZZ, HIGH)`).

---

## Author

Mohammad Zaid Iqbal Fahad

---