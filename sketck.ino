#define P1 2
#define P2 3
#define P3 4
#define P4 5
#define BUZZ 8

bool used[4] = {false,false,false,false};
int queue[4];
int qindex = 0;

void setup() {
  Serial.begin(9600);

  pinMode(P1, INPUT_PULLUP);
  pinMode(P2, INPUT_PULLUP);
  pinMode(P3, INPUT_PULLUP);
  pinMode(P4, INPUT_PULLUP);
  pinMode(BUZZ, OUTPUT);

  Serial.println("READY");
}

void addToQueue(int p) {
  if (used[p-1]) return;

  queue[qindex++] = p;
  used[p-1] = true;

  // Send button pressed info
  unsigned long ms = millis();
  Serial.print("BTN:");
  Serial.print(p);
  Serial.print(",");
  Serial.println(ms); // send milliseconds timestamp

  // Buzzer feedback
  digitalWrite(BUZZ, HIGH);
  delay(300);
  digitalWrite(BUZZ, LOW);
}

void nextPlayer() {
  if(qindex == 0) return;
  int removed = queue[0];

  for(int i=1;i<qindex;i++) queue[i-1]=queue[i];
  qindex--;
  used[removed-1] = false;

  // short beep
  digitalWrite(BUZZ,HIGH);
  delay(150);
  digitalWrite(BUZZ,LOW);
}

void resetQueue() {
  for(int i=0;i<4;i++) used[i]=false;
  qindex=0;
  Serial.println("RESET");
  digitalWrite(BUZZ,HIGH);
  delay(200);
  digitalWrite(BUZZ,LOW);
}

void loop() {
  if(digitalRead(P1)==LOW) addToQueue(1);
  if(digitalRead(P2)==LOW) addToQueue(2);
  if(digitalRead(P3)==LOW) addToQueue(3);
  if(digitalRead(P4)==LOW) addToQueue(4);

  // read serial commands
  if(Serial.available()>0){
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if(cmd=="RESET") resetQueue();
    else if(cmd=="NEXT") nextPlayer();
  }

  delay(50); // debounce
}
