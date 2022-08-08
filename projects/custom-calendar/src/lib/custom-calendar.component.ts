import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  SimpleChanges
} from '@angular/core';

export class CalendarDay {
  public date: Date;
  public isPastDate: boolean;
  public isToday: boolean;
  public weekIndex: number;
  public monthIndex: number;
  public year: number;
  public disable: boolean | undefined;
  public selected: boolean;

  public getDateString() {
    console.log(this.date.toLocaleDateString());
    return this.date.toISOString().split("T")[0]
  }
  // format date as 'YYYY-MM-DD'
  public getDateString2() {
    let d = this.date,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join('-');
  }
  constructor(d: Date) {
    this.date = d;
    this.isPastDate = d.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    this.isToday = d.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0);
    this.weekIndex = d.getDay();
    this.monthIndex = d.getMonth();
    this.year = d.getFullYear();
    this.disable = this.isPastDate;
    this.selected = false;
  }

}

@Pipe({
  name: 'chunk'
})
export class ChunkPipe implements PipeTransform {

  transform(calendarDaysArray: any, chunkSize: number): any {
    let calendarDays: any[][] = [];
    let weekDays: any[] = [null , null , null , null ,null ,null , null];
    let index = 0;
    calendarDaysArray.map((day: any , i: any) => {
      if(i == 0){
        index = day.weekIndex
      }
      if (index == day.weekIndex) {
        weekDays[index] = day;
      }
      index++;
      if(index == 7 || i == calendarDaysArray.length - 1){
        calendarDays.push(weekDays);
        weekDays = [null , null , null , null ,null ,null , null];
        index = 0;
      }
    });
    return calendarDays;
  }
}










@Component({
  selector: 'custom-calendar2',
  template: `
    <div class="flex align-center">
      <div class="w20 p20"  (click)="changeMonth(false)">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z"/></svg>
      </div>
      <div class="w60 text-center">{{monthNames[selectedMonth]}}</div>
      <div class="w20 text-right p20"  (click)="changeMonth(true)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill-rule="evenodd" clip-rule="evenodd"><path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/></svg>
      </div>
    </div>
    <div class="calendar">
      <div class="w100 flex">
        <div class="singleBlock"><strong>Sunday</strong></div>
        <div class="singleBlock"><strong>Monday</strong></div>
        <div class="singleBlock"><strong>Tuesday</strong></div>
        <div class="singleBlock"><strong>Wednesday</strong></div>
        <div class="singleBlock"><strong>Thursday</strong></div>
        <div class="singleBlock"><strong>Friday</strong></div>
        <div class="singleBlock"><strong>Saturday</strong></div>
      </div>
      <div>
        <div class="w100 flex" *ngFor="let row of calendar | chunk: 7; let i = index">
          <div class="singleBlock flex align-center justify-center" *ngFor="let c of row; let j = index">

            <div class="w100 block" (click)="dateClickButton(c)" [ngClass]="{'past-date disabled-date': c?.isPastDate, 'today': c?.isToday , 'selected': c?.selected ,  'disabled-date':c?.disable}">
              <p *ngIf="c" >
                {{c.date.getDate()}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./custom-calendar.component.scss']
})
export class CustomCalendarComponent implements OnInit , OnChanges {
  public calendar: CalendarDay[] = [];
  public monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  selectedDate: string | undefined;
  @Input() disable: string[] = [];
  @Input() color: string = '';
  @Output() monthChangeEvent = new EventEmitter();
  @Output() dateClick = new EventEmitter();

  ngOnInit(): void {
    this.selectedDate = this.dateString(new Date());
    document.documentElement.style.setProperty('--defaultColor', this.color ? this.color : '#726DCC');
    this.generateCalendarDays();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.generateCalendarDays();
  }

  private generateCalendarDays(): void {
    this.calendar = [];
    const totalDaysOfMonth = this.getTotalDaysOfMonth(this.selectedMonth, this.selectedYear);
    let dateToAdd = this.getStartingDateOfMonth(this.selectedMonth , this.selectedYear);
    for (let i = 0; i < totalDaysOfMonth; i++) {
      const obj = new CalendarDay(new Date(dateToAdd));
      if (this.disable.includes(obj.getDateString2())) {
        obj.disable = true;
      }
      if(obj.getDateString2() == this.selectedDate){
        obj.selected = true
      }
      this.calendar.push(obj);
      dateToAdd = this.incrementDate(dateToAdd);
    }
  }
  // this function will return total number of days of a month base on month index  and year
  public getTotalDaysOfMonth(monthIndex: number, year: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
  }
  // get month index and current year from new date object
  public getMonthIndexAndYear(date: Date): number {
    return date.getMonth();
  }
  // get starting date of month
  public getStartingDateOfMonth(monthIndex: number, year: number): Date {
    return new Date(year, monthIndex, 1);
  }
  // increment date objct by 1 day
  public incrementDate(date: Date): Date {
    return new Date(date.setDate(date.getDate() + 1));
  }
  changeMonth =  (increment: any) =>  {
    if(increment){
      this.selectedMonth++;
    }else{
      this.selectedMonth--;
    }
    if(this.selectedMonth > 11){
      this.selectedMonth = 0;
      this.selectedYear++;
    } else if(this.selectedMonth < 0){
      this.selectedMonth = 11;
      this.selectedYear--;
    }
    this.generateCalendarDays();
    this.monthChangeEvent.emit({month: this.selectedMonth, year: this.selectedYear});
  }
  dateClickButton = (date: any) => {
    if(!date.disable){
      this.calendar.map((day: any) => { day.selected = false})
      date.selected = true;
      this.selectedDate = date.getDateString2();
      console.log(this.selectedDate)
      this.dateClick.emit(date);
    }
  }
  public dateString(date: Date): string {
    let d = date,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join('-');
  }
}
