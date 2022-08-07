import { NgModule } from '@angular/core';
import {ChunkPipe, CustomCalendarComponent} from './custom-calendar.component';
import {CommonModule} from "@angular/common";



@NgModule({
  declarations: [
    CustomCalendarComponent,
    ChunkPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CustomCalendarComponent
  ]
})
export class CustomCalendarModule { }
