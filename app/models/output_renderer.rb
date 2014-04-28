module OutputRenderer
  class HTMLRenderer < Redcarpet::Render::HTML
    def block_code(code, language)

      "<pre class=\"terminal-wrap\"><span class=\"commands #{ language }\">#{ language } Terminal</span>" +
      "<code class=\"#{ language }\">#{ code }</code></pre>\n"
    end
  end

  # TODO: Sanitize
  def self.diff(lines)
    ApplicationController.new.render_to_string(partial: "templates/diff", locals: { lines: lines }, formats: [:html]).html_safe
  end

  def self.markdown(content)
    Redcarpet::Markdown.new(HTMLRenderer.new,
      safe_links_only: true,
      filter_html: true,
      autolink: true,
      fenced_code_blocks: true,
    ).render(content)
  end
end
