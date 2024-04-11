#!/bin/bash

images_directory="attachments"

if [ -d "$images_directory" ]; then
    rm -f "$images_directory"/*
    echo "Загруженные изображения успешно удалены."
else
    echo "Директория с изображениями не найдена."
fi