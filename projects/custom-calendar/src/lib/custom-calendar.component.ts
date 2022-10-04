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

  transform(calendarDaysArray: any, firstDay: any): any {
    let calendarDays: any[][] = [];
    let weekDays: any[] = [null, null, null, null, null, null, null];
    let index = 0;
    calendarDaysArray.map((day: any, date: any) => {
      //this to find start of calendar
      const indexDiff = (day.weekIndex - firstDay);
      if (date == 0) {
        index = (indexDiff < 0) ? (indexDiff + 7) : indexDiff;
        if (index == 0 && date == 0) {
          weekDays[firstDay] = day;
        }
      }
      //to assign values of week
      if ((indexDiff >= 0) && date != 0) {
        if (index == indexDiff) {
          weekDays[index] = day;
        }
      } else {
        weekDays[index] = day;
      }
      index++;
      if (index == 7 || date == calendarDaysArray.length - 1) {
        calendarDays.push(weekDays);
        weekDays = [null, null, null, null, null, null, null];
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
      <div class="w20 p20" [ngClass]="{'disabled-date':backDisable}" (click)="changeMonth(false)"
           *ngIf="!monthListOpen && !yearListOpen">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
          <path d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z"/>
        </svg>
      </div>
      <div (click)="findMonth()"
           class="w60 p20 text-center name_of_month"><p>{{month_is}}&nbsp;{{showYear ? selectedYear : ''}}</p></div>
      <div class="w20 text-right p20" [ngClass]="{'disabled-date':forwardDisable}" (click)="changeMonth(true)"
           *ngIf="!monthListOpen && !yearListOpen">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill-rule="evenodd" clip-rule="evenodd">
          <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
        </svg>
      </div>
    </div>
    <div class="calendar" *ngIf="!monthListOpen && !yearListOpen">
      <div class="w100 flex">
        <div class="singleBlock" *ngFor="let day of weekDays"><strong>{{day}}</strong></div>
      </div>
      <div>
        <div class="w100 flex" *ngFor="let row of calendar | chunk: firstDayOfWeek; let i = index">
          <div class="singleBlock flex align-center justify-center" *ngFor="let c of row; let j = index">
            <div class="w100 block" (click)="dateClickButton(c)"
                 [ngClass]="{'past-date disabled-date': c?.isPastDate, 'today': c?.isToday , 'selected': c?.selected ,  'disabled-date':c?.disable}">
              <p *ngIf="c">
                {{c.date.getDate()}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="list" *ngIf="monthListOpen">
      <div class="singleBlockParent" *ngFor="let month of allMonths ; let i = index"
           [ngClass]="{'listSelector': (month.month_name == monthNames[selectedMonth])}">
        <div class="singleBlock">
          <div class="w100 justify-center flex align-center">
            <p class="block listblock" (click)="openThisMonth(i,month)"
               [ngClass]="{'disabled-date': month.month_disable == true}">{{month.month_name}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="list" *ngIf="yearListOpen">
      <div class="singleBlockParent" *ngFor="let year of all_years ; let i = index"
           [ngClass]="{'listSelector': year == selectedYear}">
        <div class="singleBlock ">
          <div class="w100 justify-center flex align-center">
            <p class="block listblock" (click)="openThisYear(year)">{{year}}</p>
          </div>
        </div>
      </div>
    </div>

  `,
  styleUrls: ['./custom-calendar.component.scss']
})
export class CustomCalendarComponent implements OnInit, OnChanges {
  public calendar: CalendarDay[] = [];
  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  backDisable = false;
  forwardDisable = false;
  @Input() disable: string[] = [];
  @Input() color: string = '';
  @Input() selectedDate: string | undefined = '';
  @Input() monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  @Input() weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  @Input() showYear = false;
  @Input() disableBack = false;
  @Input() disableFuture = false;
  @Input() firstDayOfWeek: number = 0;
  @Output() monthChangeEvent = new EventEmitter();
  @Output() dateClick = new EventEmitter();
  newWeekDays1: any = [];
  newWeekDays2: any = [];
  monthListOpen: boolean = false;
  yearListOpen: boolean = false;
  all_years: any[] = [];
  month_is: any = '';
  allMonths: any = [
    {month_name: "January", month_disable: false},
    {month_name: "February", month_disable: false},
    {month_name: "March", month_disable: false},
    {month_name: "April", month_disable: false},
    {month_name: "May", month_disable: false},
    {month_name: "June", month_disable: false},
    {month_name: "July", month_disable: false},
    {month_name: "August", month_disable: false},
    {month_name: "September", month_disable: false},
    {month_name: "October", month_disable: false},
    {month_name: "November", month_disable: false},
    {month_name: "December", month_disable: false}];

  ngOnInit(): void {
    this.setFirstDayOfWeek(this.firstDayOfWeek)
    this.selectedDate = (this.selectedDate == '' || !this.selectedDate || this.selectedDate == undefined) ? this.dateString(new Date()) : this.selectedDate;
    if (this.getMonthIndexAndYear(new Date(this.selectedDate)) != this.selectedMonth) {
      this.selectedMonth = new Date(this.selectedDate).getMonth();
      this.selectedYear = new Date(this.selectedDate).getFullYear();
    }
    this.forwardDisable = (this.currentMonth == this.calendar[0].monthIndex)

    this.setmonth()
    this.checkForDisableArrows()
    document.documentElement.style.setProperty('--defaultColor', this.color ? this.color : '#726DCC');
    this.generateCalendarDays();
    if (!((this.firstDayOfWeek >= 0) && (this.firstDayOfWeek < 7))) {
      this.firstDayOfWeek = 0;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.generateCalendarDays();
  }

  //set first day of the week
  setFirstDayOfWeek(firstDayOfWeek: any) {
    for (let i = 0; i < 7; i++) {
      if (i < firstDayOfWeek) {
        this.newWeekDays1.push(this.weekDays[i])
      } else {
        this.newWeekDays2.push(this.weekDays[i])
      }
    }
    this.weekDays = this.newWeekDays2.concat(this.newWeekDays1)
  }

  private generateCalendarDays(): void {
    this.calendar = [];
    const totalDaysOfMonth = this.getTotalDaysOfMonth(this.selectedMonth, this.selectedYear);
    let dateToAdd = this.getStartingDateOfMonth(this.selectedMonth, this.selectedYear);
    for (let i = 0; i < totalDaysOfMonth; i++) {
      const obj = new CalendarDay(new Date(dateToAdd));
      if (this.disable.includes(obj.getDateString2())) {
        obj.disable = true;
      }
      if (obj.getDateString2() == this.selectedDate) {
        obj.selected = true
      }
      this.calendar.push(obj);
      dateToAdd = this.incrementDate(dateToAdd);
    }
    this.checkForDisableArrows()
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

  // increment date object by 1 day
  public incrementDate(date: Date): Date {
    return new Date(date.setDate(date.getDate() + 1));
  }

  //increment and decrement of month
  changeMonth = (increment: any) => {
    if (increment) {
      if (!this.disableFuture) {
        this.selectedMonth++;
      } else {
        this.checkForDisableArrows()
        if (this.currentMonth != this.calendar[0].monthIndex) {
          this.selectedMonth++;
        }
      }
    } else {
      if (!this.disableBack) {
        this.backDisable = false
        this.selectedMonth--;
      } else {
        this.checkForDisableArrows()
        if (this.currentMonth != this.calendar[0].monthIndex) {
          this.selectedMonth--;
        }
      }
    }
    if (this.selectedMonth > 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else if (this.selectedMonth < 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    }
    this.setmonth();
    this.generateCalendarDays();
    this.monthChangeEvent.emit({month: this.selectedMonth, year: this.selectedYear});
  }
  //select date
  dateClickButton = (date: any) => {
    if (!date.disable) {
      this.calendar.map((day: any) => {
        day.selected = false
      })
      date.selected = true;
      this.selectedDate = date.getDateString2();
      const dateDetails = {
        date: date,
        selectedDate: this.selectedDate
      }
      this.dateClick.emit(dateDetails);
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

  //open list of month
  findMonth() {
    if (this.disableBack) {
      this.disableOldMonths()
    }
    if (this.monthListOpen) {
      this.monthListOpen = false
      this.yearListOpen = true
      this.all_years = []
      let x = new Date().getFullYear()
      for (let i = 0; i < 12; i++) {
        this.all_years.push(x)
        x++
      }
    } else {
      this.monthListOpen = true
      this.yearListOpen = false
    }
    this.month_is = ''
  }

  //open the month clicked
  openThisMonth(index: any, month: any) {
    if (month.month_disable == false) {
      this.selectedMonth = index;
      this.setmonth();
      this.generateCalendarDays();
      this.monthChangeEvent.emit({month: this.selectedMonth, year: this.selectedYear});
      this.monthListOpen = false;
      this.yearListOpen = false;
    }
  }

  //open the year clicked
  openThisYear(year: number) {
    this.selectedYear = year;
    this.monthListOpen = true;
    this.yearListOpen = false;
    if (this.disableBack) {
      this.disableOldMonths()
    }
  }

  //for showing which month is selected
  setmonth() {
    this.month_is = this.monthNames[this.selectedMonth]
  }

  checkForDisableArrows() {
    this.backDisable = (this.currentMonth == this.calendar[0].monthIndex) && this.disableBack
    this.forwardDisable = (this.currentMonth == this.calendar[0].monthIndex) && this.disableFuture
  }

  disableOldMonths() {
    for (let i = 0; i < this.allMonths.length; i++) {
      this.allMonths[i].month_disable = (i < this.currentMonth) && (this.selectedYear == this.currentYear);
    }
  }
}
