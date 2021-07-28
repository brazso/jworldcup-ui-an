import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { default as ApiEndpoints } from 'src/app/core/constants/api-endpoints.json';
import { GenericResponse } from '../models/common';
import { User, JwtRequest, JwtResponse } from '../models/user';

@Injectable({
	providedIn: 'root'
  })
export class AuthorityService {

	token: string | undefined; // JSON Web Token
	user: User | undefined;

	constructor(
		private readonly apiService: ApiService,
		private readonly router: Router
		) {
	}

	checkSession() {
		this.apiService.get<GenericResponse<User>>(ApiEndpoints.USERS.WHOAMI)
			.subscribe(
				response => {
					if (response.successful && response.data) {
						let user: User = response.data;
						this.user = user;
						// sessionStorage.setItem('username', user.loginName!);
					} else {
						this.unauthenticate();
					}

					return;
				}
			);
	}

	authenticate(credentials: JwtRequest) {
		if (credentials) {
			const body: FormData = new FormData();
			body.append('username', credentials.username);
			body.append('password', credentials.password);

			this.apiService.post<JwtResponse>(ApiEndpoints.LOGIN, body)
				.subscribe(
					response => {
						if (response.token) {
							this.token = response.token;
							// sessionStorage.setItem('token', response.token);
							this.checkSession(); // init this.user in the background
						} else {
							this.unauthenticate();
						}
						this.router.navigateByUrl('/');
					}
				);
		}
	}

	unauthenticate() {
		//this.token = undefined;
		delete(this.token);
		//this.user = undefined;
		delete(this.user);
	}

	logout(): any {
		this.apiService.post<void>(ApiEndpoints.LOGOUT)
			.subscribe(
				response => {
					this.unauthenticate();
				},
				error => {
					this.unauthenticate();
				},
				() => {
					this.unauthenticate();
					// Get a new JWT token
					this.checkSession();
				}
			);
	}

	isUserAuthenticated(): boolean {
		return !!this.user && !!this.token;
	}

	/**
	 * Checks if the autheticated user has the given role
	 * Returns false if there is no authenticated user.
	 * @param role role to be checked, e.g. "felh_karbantartas"
	 */
	isUserHasRole(role: string): boolean {
		return !!this.user?.authorities?.includes(role);
	}
}
