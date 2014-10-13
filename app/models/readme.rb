# Parses a readme file based on a to-be-stablized format.
# As of now it assumes markdown and treates h1 headers (# Blah on newline)
# as break points. Content directly following a header is associated with that step.
class Readme

  def initialize(content)
    @content = content
    @total_lines = @content.present? ? @content.lines.count : 0
  end

  def steps
    headers_human.each_with_index.map do |header, i|
      {
        title: header,
        slug: OutputRenderer.clean_slug_and_escape(header),
        index: i
      }
    end
  end

  def chunk(index)
    parse_chunk(index)
  end

  def headers_human
    @headers_human ||= _headers_human
  end

  def _headers_human
    headers.map do |header|
      header[:content].slice(1, header[:content].length).strip
    end
  end

  def headers
    @headers ||= _headers
  end

  def _headers
    headers = []
    @content.each_line.each_with_index do |line, i|
      next unless line.start_with?("# ")

      headers << {
        index: i,
        content: line,
      }
    end

    headers
  end

  def parse_chunk(index)
    return {} unless headers[index]

    end_index = headers[index+1] ? headers[index+1][:index] : @total_lines


    output = @content
              .lines
              .to_a
              .slice(headers[index][:index], (end_index-headers[index][:index]))

    output.shift
    output = output.join

    split_index = nil
    output.each_line.each_with_index do |line, i|
      next unless line.start_with?("---")
      split_index = i
      break
    end

    if split_index
      {
        lesson: OutputRenderer.markdown(output.lines.to_a.slice(0, split_index).join),
        output: OutputRenderer.markdown(output.lines.to_a.slice((split_index+1), output.lines.count).join)
      }
    else
      {
        lesson: OutputRenderer.markdown(output)
      }
    end
  end
end
