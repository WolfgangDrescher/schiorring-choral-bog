<?php

require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\String\Slugger\AsciiSlugger;

$slugger = new AsciiSlugger();
echo $slugger->slug($argv[1])->lower()->trim();
