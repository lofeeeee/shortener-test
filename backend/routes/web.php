<?php

use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Short-link redirect
| Must be last — catches all single-segment paths as short codes.
|--------------------------------------------------------------------------
*/
Route::get('/{uniqueId}', [RedirectController::class, 'redirect'])
    ->name('link.redirect')
    ->where('uniqueId', '[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]')
    ->middleware('throttle:redirect');
