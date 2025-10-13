import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { User } from "../interface/user";


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseURL: string = "https://68e7643710e3f82fbf3eee4f.mockapi.io/api/v1";


  constructor(private _http: HttpClient) {}

  getUserData(id:any): Observable<User | null> {
    return this._http.get<User>(`${this.baseURL}/submitForm/${id}`);
  }

  saveUserData(userData: User): Observable<User> {
    return this._http.post<User>(`${this.baseURL}/submitForm`, userData);
  }

  checkIfFormExists(): Observable<User | null> {
    return this._http.get<User>(`${this.baseURL}/submitForm`);
  }

  updateUserData(userData: User, id:any): Observable<User> {
    return this._http.put<User>(`${this.baseURL}/submitForm` + `/${id}`, userData)
  }

}

