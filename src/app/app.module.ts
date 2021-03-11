import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { AppRoutingModule } from './app-routing.module';
import {PreloadAllModules, RouterModule} from '@angular/router';
import { AppComponent } from './app.component';
import { DefaultModule } from './layouts/default/default.module';
import { HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
  //  AppRoutingModule,
    RouterModule.forRoot([]),
    DefaultModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }