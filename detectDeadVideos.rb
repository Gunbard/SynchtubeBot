#!/usr/bin/ruby

=begin
  Synchtube Dead Video Checker
  Author: WAHPOMF
  
  This script will take in or check for a playlist.txt that should contain the innerHTML of the playlist (div#playlist_items). Save this to a text file and pass it to this script. When finished, a text file containing the list of dead videos will be written.
  
  NOTE: You must change the playlist to be in thumbnail mode before copying.
=end

require 'open-uri'

YOUTUBE_URL = 'http://www.youtube.com/watch?v='
video_item_pattern = /http:\/\/i.ytimg.com\/vi\/(.*?)\/default.jpg.*?<div class="title play">(.*?)<\/div>/
FILENAME = 'playlist.txt'
FILENAME_OUT = 'ded.txt'
WORKING_DIR = '/etc/pyphantomjs/deadVideoCheck/'

if ARGV.length == 1
  FILENAME = File.basename(ARGV[0])
end

# Open playlist file
file = File.new(FILENAME)
file_contents = file.read
file.close

videos = file_contents.scan(video_item_pattern)

ded_videos = []

# Check all videos
videos.each do |video|
  begin
    open("#{YOUTUBE_URL + video[0]}")
  rescue OpenURI::HTTPError
	ded_videos.push(video[1] + ', ' + YOUTUBE_URL + video[0]);
  end
end

# Write to file
File.open("#{WORKING_DIR}#{FILENAME_OUT}", 'w') do |file|
  ded_videos.each do |video|
	file.write(video)
  end
end

# Delete request file
if File.exist?("#{WORKING_DIR}#{FILENAME}")
  File.delete("#{WORKING_DIR}#{FILENAME}")
end

puts 'Dead video request complete.'
