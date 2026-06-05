<?php

use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

$slugPattern = '[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]';

Route::post('/{uniqueId}/verify', [RedirectController::class, 'verify'])
    ->name('link.verify')
    ->where('uniqueId', $slugPattern)
    ->middleware('throttle:10,1'); // 10 attempts per minute per IP

/*
|--------------------------------------------------------------------------
| Short-link redirect — must be last
|--------------------------------------------------------------------------
*/
Route::get('/{uniqueId}', [RedirectController::class, 'redirect'])
    ->name('link.redirect')
    ->where('uniqueId', $slugPattern)
    ->middleware('throttle:redirect');
